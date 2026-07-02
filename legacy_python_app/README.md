# CampusFind - Lost and Found Portal

A web-based Lost and Found portal designed to help students and staff report, track, and retrieve lost items on campus. The system allows users to report lost and found items, view available listings, and receive automated matching notifications.

## Features

- User authentication and registration
- Report lost items with details and images
- Report found items with details and images
- Browse and search through lost and found items
- Admin dashboard for managing items and users
- Responsive design for all devices

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Flask (Python)
- **Storage**: CSV files for data persistence
- **Image Storage**: Local file system

## Setup Instructions

### Prerequisites

- Python 3.7+ installed on your system
- pip package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/campusfind.git
   cd campusfind
   ```

2. Create and activate a virtual environment (recommended):
   ```
   # On Windows
   python -m venv venv
   venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python app.py
   ```

5. Access the application in your web browser at:
   ```
   http://127.0.0.1:5000/
   ```

### Default Admin Account

After starting the application for the first time, a default admin account will be created:

- **Username**: admin
- **Password**: admin123

*Note: It's recommended to change the default admin password after first login for security purposes.*

## Directory Structure

- `app.py`: Main Flask application file
- `templates/`: HTML templates
- `static/`: Static assets (CSS, JavaScript, uploads)
- `data/`: CSV files for data storage
  - `users.csv`: User account information
  - `lost_items.csv`: Lost item reports
  - `found_items.csv`: Found item reports

## License

This project is licensed under the MIT License - see the LICENSE file for details.
