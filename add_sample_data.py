import requests
import json

# Backend URL
BACKEND_URL = "http://localhost:8001/api"

# Sample data for movies and series
sample_movies = [
    {
        "title": "Inception",
        "description": "A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into a CEO's mind.",
        "genre": "Sci-Fi",
        "year": 2010,
        "rating": 4.8,
        "image_url": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=YoHD9XEInc0",
        "duration": 148
    },
    {
        "title": "The Dark Knight",
        "description": "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and Harvey Dent.",
        "genre": "Action",
        "year": 2008,
        "rating": 4.9,
        "image_url": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=EXeTwQWrcwY",
        "duration": 152
    },
    {
        "title": "Pulp Fiction",
        "description": "The lives of two mob hitmen, a boxer, and a gangster and his wife intertwine in four tales of violence.",
        "genre": "Crime",
        "year": 1994,
        "rating": 4.7,
        "image_url": "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
        "duration": 154
    },
    {
        "title": "Forrest Gump",
        "description": "The presidencies of Kennedy and Johnson through the eyes of an Alabama man with an IQ of 75.",
        "genre": "Drama",
        "year": 1994,
        "rating": 4.6,
        "image_url": "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=bLvqoHBptjg",
        "duration": 142
    },
    {
        "title": "The Matrix",
        "description": "A computer hacker learns from mysterious rebels about the true nature of his reality.",
        "genre": "Sci-Fi",
        "year": 1999,
        "rating": 4.8,
        "image_url": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=vKQi3bBA1y8",
        "duration": 136
    },
    {
        "title": "Goodfellas",
        "description": "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen.",
        "genre": "Crime",
        "year": 1990,
        "rating": 4.7,
        "image_url": "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=qo5jJpHtI1Y",
        "duration": 148
    },
    {
        "title": "The Shawshank Redemption",
        "description": "Two imprisoned men bond over several years, finding solace and eventual redemption through acts of common decency.",
        "genre": "Drama",
        "year": 1994,
        "rating": 4.9,
        "image_url": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=6hB3S9bIaco",
        "duration": 142
    },
    {
        "title": "Fight Club",
        "description": "An insomniac office worker and a soap salesman form an underground fight club.",
        "genre": "Drama",
        "year": 1999,
        "rating": 4.8,
        "image_url": "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=qtRKdVHc-cE",
        "duration": 139
    },
    {
        "title": "The Godfather",
        "description": "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
        "genre": "Crime",
        "year": 1972,
        "rating": 4.9,
        "image_url": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=sY1S34973zA",
        "duration": 175
    },
    {
        "title": "Interstellar",
        "description": "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        "genre": "Sci-Fi",
        "year": 2014,
        "rating": 4.7,
        "image_url": "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=zSWdZVtXT7E",
        "duration": 169
    }
]

sample_series = [
    {
        "title": "Breaking Bad",
        "description": "A high school chemistry teacher turned methamphetamine producer partners with a former student.",
        "genre": "Crime",
        "year": 2008,
        "rating": 4.9,
        "image_url": "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=HhesaQXLuRY",
        "seasons": 5,
        "episodes": 62
    },
    {
        "title": "Game of Thrones",
        "description": "Nine noble families fight for control over the mythical lands of Westeros.",
        "genre": "Fantasy",
        "year": 2011,
        "rating": 4.6,
        "image_url": "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQy0wMqKi.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=rlR4PJn8b8I",
        "seasons": 8,
        "episodes": 73
    },
    {
        "title": "Stranger Things",
        "description": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments.",
        "genre": "Sci-Fi",
        "year": 2016,
        "rating": 4.7,
        "image_url": "https://image.tmdb.org/t/p/w500/b9gTJKLdSbwcQRKzmqQXdwGBQAB.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=b9EkMc79ZSU",
        "seasons": 4,
        "episodes": 34
    },
    {
        "title": "The Office",
        "description": "A mockumentary on a group of typical office workers, where the workday consists of ego clashes.",
        "genre": "Comedy",
        "year": 2005,
        "rating": 4.8,
        "image_url": "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=LHOtME2DL4g",
        "seasons": 9,
        "episodes": 201
    },
    {
        "title": "The Crown",
        "description": "Follows the political rivalries and romance of Queen Elizabeth II's reign.",
        "genre": "Drama",
        "year": 2016,
        "rating": 4.5,
        "image_url": "https://image.tmdb.org/t/p/w500/4JLNYjQFqsGAIiCQEVqgqiQOdFJ.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=JWtnJjn6ng0",
        "seasons": 6,
        "episodes": 60
    },
    {
        "title": "House of Cards",
        "description": "A congressman works with his wife to exact revenge on the people who betrayed him.",
        "genre": "Drama",
        "year": 2013,
        "rating": 4.4,
        "image_url": "https://image.tmdb.org/t/p/w500/hKWxWjFwnMvkWQawbhvC0Y7ygQ8.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=ULwUzF1q5w4",
        "seasons": 6,
        "episodes": 73
    },
    {
        "title": "Narcos",
        "description": "A chronicled look at the criminal exploits of Colombian drug lord Pablo Escobar.",
        "genre": "Crime",
        "year": 2015,
        "rating": 4.6,
        "image_url": "https://image.tmdb.org/t/p/w500/rTmal9fDbwh5F0waol2hq35U4ah.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=U7elNhHwgBU",
        "seasons": 3,
        "episodes": 30
    },
    {
        "title": "Black Mirror",
        "description": "An anthology series exploring a twisted, high-tech multiverse.",
        "genre": "Sci-Fi",
        "year": 2011,
        "rating": 4.5,
        "image_url": "https://image.tmdb.org/t/p/w500/5UaYsGZOFhjFDwQh6GuLjjA1WlF.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=jROLrhQkK78",
        "seasons": 6,
        "episodes": 27
    }
]

def add_sample_data():
    print("Adding sample movies...")
    
    # First, create a test user and get token
    try:
        # Register a test user
        register_response = requests.post(f"{BACKEND_URL}/auth/register", json={
            "email": "test@netflix.com",
            "password": "password123",
            "full_name": "Test User"
        })
        
        if register_response.status_code == 200:
            token = register_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # Add movies
            for movie in sample_movies:
                response = requests.post(f"{BACKEND_URL}/movies", json=movie, headers=headers)
                if response.status_code == 200:
                    print(f"✓ Added movie: {movie['title']}")
                else:
                    print(f"✗ Failed to add movie: {movie['title']}")
            
            # Add series
            for series in sample_series:
                response = requests.post(f"{BACKEND_URL}/series", json=series, headers=headers)
                if response.status_code == 200:
                    print(f"✓ Added series: {series['title']}")
                else:
                    print(f"✗ Failed to add series: {series['title']}")
                    
            print("\nSample data added successfully!")
            
        else:
            print(f"Failed to register test user: {register_response.text}")
            
    except Exception as e:
        print(f"Error adding sample data: {e}")

if __name__ == "__main__":
    add_sample_data()