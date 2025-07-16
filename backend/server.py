from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import os
from uuid import uuid4

# Configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/netflix_clone")
client = MongoClient(MONGO_URL)
db = client.netflix_clone

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# FastAPI app
app = FastAPI(title="Netflix Clone API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class Profile(BaseModel):
    name: str
    avatar: str = "default.png"
    is_kids: bool = False

class Movie(BaseModel):
    title: str
    description: str
    genre: str
    year: int
    rating: float
    image_url: str
    trailer_url: str
    duration: int  # in minutes

class Series(BaseModel):
    title: str
    description: str
    genre: str
    year: int
    rating: float
    image_url: str
    trailer_url: str
    seasons: int
    episodes: int

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Authentication endpoints
@app.post("/api/auth/register")
async def register(user: UserRegister):
    # Check if user exists
    if db.users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_id = str(uuid4())
    hashed_password = get_password_hash(user.password)
    
    user_doc = {
        "id": user_id,
        "email": user.email,
        "password": hashed_password,
        "full_name": user.full_name,
        "created_at": datetime.utcnow(),
        "profiles": []
    }
    
    db.users.insert_one(user_doc)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_id}

@app.post("/api/auth/login")
async def login(user: UserLogin):
    # Find user
    user_doc = db.users.find_one({"email": user.email})
    if not user_doc or not verify_password(user.password, user_doc["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_doc["id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": user_doc["id"]}

@app.get("/api/auth/me")
async def get_current_user(user_id: str = Depends(verify_token)):
    user = db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "full_name": user["full_name"],
        "profiles": user.get("profiles", [])
    }

# Profile endpoints
@app.post("/api/profiles")
async def create_profile(profile: Profile, user_id: str = Depends(verify_token)):
    profile_id = str(uuid4())
    profile_doc = {
        "id": profile_id,
        "name": profile.name,
        "avatar": profile.avatar,
        "is_kids": profile.is_kids,
        "watchlist": [],
        "created_at": datetime.utcnow()
    }
    
    db.users.update_one(
        {"id": user_id},
        {"$push": {"profiles": profile_doc}}
    )
    
    return {"id": profile_id, "message": "Profile created successfully"}

@app.get("/api/profiles")
async def get_profiles(user_id: str = Depends(verify_token)):
    user = db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.get("profiles", [])

# Movies endpoints
@app.get("/api/movies")
async def get_movies(genre: Optional[str] = None, limit: int = 20):
    query = {}
    if genre:
        query["genre"] = genre
    
    movies = list(db.movies.find(query).limit(limit))
    for movie in movies:
        movie["_id"] = str(movie["_id"])
    
    return movies

@app.get("/api/movies/{movie_id}")
async def get_movie(movie_id: str):
    movie = db.movies.find_one({"id": movie_id})
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    movie["_id"] = str(movie["_id"])
    return movie

@app.post("/api/movies")
async def add_movie(movie: Movie, user_id: str = Depends(verify_token)):
    movie_id = str(uuid4())
    movie_doc = {
        "id": movie_id,
        "title": movie.title,
        "description": movie.description,
        "genre": movie.genre,
        "year": movie.year,
        "rating": movie.rating,
        "image_url": movie.image_url,
        "trailer_url": movie.trailer_url,
        "duration": movie.duration,
        "created_at": datetime.utcnow()
    }
    
    db.movies.insert_one(movie_doc)
    return {"id": movie_id, "message": "Movie added successfully"}

# Series endpoints
@app.get("/api/series")
async def get_series(genre: Optional[str] = None, limit: int = 20):
    query = {}
    if genre:
        query["genre"] = genre
    
    series = list(db.series.find(query).limit(limit))
    for serie in series:
        serie["_id"] = str(serie["_id"])
    
    return series

@app.post("/api/series")
async def add_series(series: Series, user_id: str = Depends(verify_token)):
    series_id = str(uuid4())
    series_doc = {
        "id": series_id,
        "title": series.title,
        "description": series.description,
        "genre": series.genre,
        "year": series.year,
        "rating": series.rating,
        "image_url": series.image_url,
        "trailer_url": series.trailer_url,
        "seasons": series.seasons,
        "episodes": series.episodes,
        "created_at": datetime.utcnow()
    }
    
    db.series.insert_one(series_doc)
    return {"id": series_id, "message": "Series added successfully"}

# Search endpoint
@app.get("/api/search")
async def search_content(q: str, content_type: Optional[str] = None):
    results = []
    
    # Search movies
    if not content_type or content_type == "movies":
        movies = list(db.movies.find({
            "$or": [
                {"title": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}},
                {"genre": {"$regex": q, "$options": "i"}}
            ]
        }).limit(10))
        
        for movie in movies:
            movie["_id"] = str(movie["_id"])
            movie["content_type"] = "movie"
            results.append(movie)
    
    # Search series
    if not content_type or content_type == "series":
        series = list(db.series.find({
            "$or": [
                {"title": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}},
                {"genre": {"$regex": q, "$options": "i"}}
            ]
        }).limit(10))
        
        for serie in series:
            serie["_id"] = str(serie["_id"])
            serie["content_type"] = "series"
            results.append(serie)
    
    return results

# Watchlist endpoints
@app.post("/api/watchlist/{profile_id}/{content_id}")
async def add_to_watchlist(profile_id: str, content_id: str, user_id: str = Depends(verify_token)):
    db.users.update_one(
        {"id": user_id, "profiles.id": profile_id},
        {"$addToSet": {"profiles.$.watchlist": content_id}}
    )
    return {"message": "Added to watchlist"}

@app.delete("/api/watchlist/{profile_id}/{content_id}")
async def remove_from_watchlist(profile_id: str, content_id: str, user_id: str = Depends(verify_token)):
    db.users.update_one(
        {"id": user_id, "profiles.id": profile_id},
        {"$pull": {"profiles.$.watchlist": content_id}}
    )
    return {"message": "Removed from watchlist"}

@app.get("/api/watchlist/{profile_id}")
async def get_watchlist(profile_id: str, user_id: str = Depends(verify_token)):
    user = db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = next((p for p in user.get("profiles", []) if p["id"] == profile_id), None)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    watchlist_ids = profile.get("watchlist", [])
    
    # Get movies and series from watchlist
    movies = list(db.movies.find({"id": {"$in": watchlist_ids}}))
    series = list(db.series.find({"id": {"$in": watchlist_ids}}))
    
    for movie in movies:
        movie["_id"] = str(movie["_id"])
        movie["content_type"] = "movie"
    
    for serie in series:
        serie["_id"] = str(serie["_id"])
        serie["content_type"] = "series"
    
    return movies + series

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)