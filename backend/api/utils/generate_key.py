import random
import string


def generate_key():
    return "".join(random.choices(string.ascii_letters + string.digits, k=32))
