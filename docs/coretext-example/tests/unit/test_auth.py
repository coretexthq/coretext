import unittest
from src.api.auth import hash_password, verify_password

class TestAuth(unittest.TestCase):
    def test_password_hashing(self):
        password = "secure_password"
        hashed = hash_password(password)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("wrong_password", hashed))

if __name__ == '__main__':
    unittest.main()
