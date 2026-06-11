# test_validation.py

import sys
import os

# Add Docker_Tools directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../Tools/Docker_Tools'))

from validation_container import (
    start_validation_container
)

result = start_validation_container(
    file_path="test.py",
    patched_content="print('hello'"
)

print(result)