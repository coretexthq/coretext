import bcrypt

def hash_password(password: str) -> str:
    """Hashes a password using bcrypt."""
    # Placeholder for authentication logic
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password: str, hashed: str) -> bool:
    """Verifies a password against its hash."""
    return bcrypt.checkpw(password.encode(), hashed.encode())
