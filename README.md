# Career.Dev - DevTools

A unified application for job seekers featuring:
- **Resume Generator**: AI-powered resume creation using Claude
- **Job Scraper**: Remote job finder with region filtering for Uganda/East Africa
- **Job Tracker**: Track your job applications with status management

## Project Structure

```
d:\JobTracker API\
├── app/                      # FastAPI Backend
│   ├── main.py              # Main app with API routes + static file serving
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic data schemas
│   ├── crud.py              # Database operations
│   ├── database.py          # Database configuration
│   └── __init__.py
├── static/                   # Frontend (Served by FastAPI)
│   ├── index.html           # Main HTML shell
│   ├── css/
│   │   └── styles.css       # Dark theme stylesheet
│   └── js/
│       ├── utils.js         # Shared utilities & config
│       ├── resume.js        # Resume generator logic
│       ├── scraper.js       # Job scraper + region filter
│       └── tracker.js       # Job tracker API integration
├── jobs.db                  # SQLite database
├── .gitignore              # Git ignore file
└── README.md               # This file
```

## Setup & Running

### Prerequisites
- Python 3.8+
- FastAPI, SQLAlchemy, Uvicorn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mugie07/Career.Dev01.git
cd Career.Dev01
```

2. Install dependencies:
```bash
pip install fastapi sqlalchemy uvicorn python-multipart
```

3. Run the application:
```bash
cd "d:\JobTracker API"
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

4. Open in browser:
```
http://127.0.0.1:8000
```

## API Endpoints

All API routes are prefixed with `/api/`:

- `GET /api/` - Health check
- `GET /api/jobs` - Fetch all tracked jobs
- `POST /api/jobs` - Create a new job entry
- `PUT /api/jobs/{job_id}` - Update job status
- `DELETE /api/jobs/{job_id}` - Delete a job entry

## Features

### Resume Generator
- Fill in personal info, experience, education, skills
- AI-powered resume generation using Claude API
- Multiple tone options (Professional, Technical, Creative, Executive)
- PDF preview and download
- Target job-specific customization

### Job Scraper
- Search for remote jobs by keyword, level, category
- AI-generated realistic job listings
- **Region filtering**: Automatically hides US-only and EU-only jobs
- Only shows jobs open to Uganda/East Africa
- Save jobs directly to tracker
- Quick apply links

### Job Tracker
- Persistent job application tracking (SQLite)
- Status tracking: Applied → Interview → Hired/Rejected
- Real-time statistics dashboard
- Manual job entry
- Edit and delete applications
- API health monitoring

## Configuration

### Update API Endpoint
In `static/js/utils.js`, update the API endpoint if deploying to production:
```javascript
const TRACKER_API = 'https://your-domain.com/api';
```

### Update Claude API Key
Add your Claude API key to environment variables or the code for resume generation.

## File Structure Details

- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks)
- **Backend**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite for persistent storage
- **Styling**: Dark theme with custom CSS variables
- **Fonts**: DM Mono, Instrument Serif, Geist (Google Fonts)

## Deployment Options

1. **Docker**: Containerize entire app
2. **Railway/Render**: One-click deployment
3. **AWS**: EC2 + RDS for production scale
4. **Vercel + Separate Backend**: Split frontend/backend

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python, FastAPI
- **Database**: SQLite, SQLAlchemy ORM
- **AI**: Claude API (Anthropic)
- **Deployment**: Uvicorn

## Development

### Add New Features
1. Update HTML/CSS/JS in `static/`
2. Add API routes in `app/main.py`
3. Update database models in `app/models.py`
4. Restart server (auto-reload enabled in dev)

### Testing
Run the application locally and test all three features through the UI.

## Future Enhancements

- [ ] LinkedIn scraper integration
- [ ] Email notifications for interview invites
- [ ] Cover letter generator
- [ ] Salary negotiation insights
- [ ] Interview prep resources
- [ ] Multi-user authentication
- [ ] Mobile app

## License

MIT

## Contact

- GitHub: [@Mugie07](https://github.com/Mugie07)
- Repository: [Career.Dev01](https://github.com/Mugie07/Career.Dev01)
