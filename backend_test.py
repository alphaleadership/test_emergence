#!/usr/bin/env python3
"""
Netflix Clone Backend API Test Suite
Tests all backend endpoints for functionality and integration
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class NetflixAPITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.profile_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
        
        result = f"{status} - {name}"
        if details:
            result += f" | {details}"
        
        print(result)
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request and validate response"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.make_request('GET', 'health')
        self.log_test("Health Check", success and response.get('status') == 'healthy')
        return success

    def test_user_registration(self):
        """Test user registration"""
        test_user = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@netflix.com",
            "password": "password123",
            "full_name": "Test User"
        }
        
        success, response = self.make_request('POST', 'auth/register', test_user)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user_id']
            self.log_test("User Registration", True, f"User ID: {self.user_id}")
            return True
        else:
            self.log_test("User Registration", False, str(response))
            return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        login_data = {
            "email": "test@netflix.com",
            "password": "password123"
        }
        
        success, response = self.make_request('POST', 'auth/login', login_data)
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user_id']
            self.log_test("User Login", True, f"Token received")
            return True
        else:
            self.log_test("User Login", False, str(response))
            return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.make_request('GET', 'auth/me')
        
        if success and 'id' in response and 'email' in response:
            self.log_test("Get Current User", True, f"Email: {response.get('email')}")
            return True
        else:
            self.log_test("Get Current User", False, str(response))
            return False

    def test_create_profile(self):
        """Test creating a user profile"""
        profile_data = {
            "name": "Test Profile",
            "avatar": "default.png",
            "is_kids": False
        }
        
        success, response = self.make_request('POST', 'profiles', profile_data)
        
        if success and 'id' in response:
            self.profile_id = response['id']
            self.log_test("Create Profile", True, f"Profile ID: {self.profile_id}")
            return True
        else:
            self.log_test("Create Profile", False, str(response))
            return False

    def test_get_profiles(self):
        """Test getting user profiles"""
        success, response = self.make_request('GET', 'profiles')
        
        if success and isinstance(response, list):
            profile_count = len(response)
            self.log_test("Get Profiles", True, f"Found {profile_count} profiles")
            
            # Set profile_id if we don't have one
            if not self.profile_id and profile_count > 0:
                self.profile_id = response[0]['id']
            
            return True
        else:
            self.log_test("Get Profiles", False, str(response))
            return False

    def test_get_movies(self):
        """Test getting movies"""
        success, response = self.make_request('GET', 'movies')
        
        if success and isinstance(response, list):
            movie_count = len(response)
            self.log_test("Get Movies", True, f"Found {movie_count} movies")
            return True
        else:
            self.log_test("Get Movies", False, str(response))
            return False

    def test_get_series(self):
        """Test getting series"""
        success, response = self.make_request('GET', 'series')
        
        if success and isinstance(response, list):
            series_count = len(response)
            self.log_test("Get Series", True, f"Found {series_count} series")
            return True
        else:
            self.log_test("Get Series", False, str(response))
            return False

    def test_search_content(self):
        """Test content search"""
        success, response = self.make_request('GET', 'search?q=inception')
        
        if success and isinstance(response, list):
            result_count = len(response)
            self.log_test("Search Content", True, f"Found {result_count} results for 'inception'")
            return True
        else:
            self.log_test("Search Content", False, str(response))
            return False

    def test_add_movie(self):
        """Test adding a new movie"""
        movie_data = {
            "title": "Test Movie",
            "description": "A test movie for API testing",
            "genre": "Action",
            "year": 2024,
            "rating": 8.5,
            "image_url": "https://example.com/test-movie.jpg",
            "trailer_url": "https://example.com/test-trailer.mp4",
            "duration": 120
        }
        
        success, response = self.make_request('POST', 'movies', movie_data)
        
        if success and 'id' in response:
            self.log_test("Add Movie", True, f"Movie ID: {response['id']}")
            return True
        else:
            self.log_test("Add Movie", False, str(response))
            return False

    def test_watchlist_operations(self):
        """Test watchlist add/remove/get operations"""
        if not self.profile_id:
            self.log_test("Watchlist Operations", False, "No profile ID available")
            return False

        # First get a movie to add to watchlist
        success, movies = self.make_request('GET', 'movies?limit=1')
        if not success or not movies:
            self.log_test("Watchlist Operations", False, "No movies available for testing")
            return False

        movie_id = movies[0].get('id')
        if not movie_id:
            self.log_test("Watchlist Operations", False, "Movie has no ID")
            return False

        # Test adding to watchlist
        success, response = self.make_request('POST', f'watchlist/{self.profile_id}/{movie_id}')
        if not success:
            self.log_test("Add to Watchlist", False, str(response))
            return False

        # Test getting watchlist
        success, watchlist = self.make_request('GET', f'watchlist/{self.profile_id}')
        if not success:
            self.log_test("Get Watchlist", False, str(watchlist))
            return False

        # Test removing from watchlist
        success, response = self.make_request('DELETE', f'watchlist/{self.profile_id}/{movie_id}')
        if success:
            self.log_test("Watchlist Operations", True, "Add/Get/Remove all successful")
            return True
        else:
            self.log_test("Remove from Watchlist", False, str(response))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Netflix Clone Backend API Tests")
        print("=" * 50)

        # Test sequence
        tests = [
            self.test_health_check,
            self.test_user_registration,
            self.test_get_current_user,
            self.test_create_profile,
            self.test_get_profiles,
            self.test_get_movies,
            self.test_get_series,
            self.test_search_content,
            self.test_add_movie,
            self.test_watchlist_operations,
        ]

        # If registration fails, try login
        if not self.token:
            print("\n🔄 Registration failed, trying login with test credentials...")
            self.test_user_login()

        # Run remaining tests
        for test in tests[2:]:  # Skip health and registration
            if not self.token and test != self.test_health_check:
                self.log_test(test.__name__, False, "No authentication token")
                continue
            test()

        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return 1

def main():
    """Main test runner"""
    # Try to get backend URL from environment
    import os
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    
    print(f"Testing backend at: {backend_url}")
    
    tester = NetflixAPITester(backend_url)
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())