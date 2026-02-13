# -*- coding: utf-8 -*-
"""
إعدادات pytest العامة والـ fixtures المشتركة
"""

import pytest
import os
import sys
from pathlib import Path

# إضافة مسار المشروع الجذر إلى Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

@pytest.fixture(scope="session")
def api_base_url():
    """Base URL للـ API"""
    return os.getenv("API_BASE_URL", "http://localhost:5000")

@pytest.fixture(scope="session")
def test_config():
    """إعدادات الاختبارات"""
    return {
        "timeout": 30,
        "retry_count": 3,
        "headers": {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "API-Test-Suite/1.0"
        }
    }

@pytest.fixture(autouse=True)
def setup_test_environment():
    """إعداد البيئة قبل كل اختبار"""
    # يمكن إضافة إعدادات خاصة هنا
    yield
    # تنظيف بعد الاختبار
    pass