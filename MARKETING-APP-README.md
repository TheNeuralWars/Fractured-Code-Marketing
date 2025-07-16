# Neural Wars Marketing Automation Application

A comprehensive web application that automates execution of the marketing plan for "The Neural Wars: Fractured Code" by leveraging all existing templates, dashboards, and workflow guides.

**🌐 Deploy to Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTheNeuralWars%2FFractured-Code-Marketing)

![Neural Wars Marketing Dashboard](https://github.com/user-attachments/assets/7dde3e0e-6875-479c-ade9-912efa45135e)

## 🚀 Quick Start

### Vercel Deployment (Recommended)
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Deploy with default settings
4. Your app will be live at `https://your-app-name.vercel.app`

### Local Development
```bash
git clone https://github.com/TheNeuralWars/Fractured-Code-Marketing.git
cd Fractured-Code-Marketing
npm install
npm start
```

Visit `http://localhost:3000` to access the application.

## 🚀 Core Features

### 📊 Campaign Dashboard
- **Real-time metrics tracking** - Amazon BSR, sales, reviews, email subscribers
- **Team status monitoring** - Visual status indicators for all team members
- **Campaign progress visualization** - Phase tracking and countdown to launch
- **Recent activity feed** - Live updates on completed tasks and milestones

### ✅ Daily Task Management
- **Comprehensive task parsing** - Automatically loads tasks from DAILY-TASK-SYSTEM.md
- **Interactive checkboxes** - Mark tasks complete with real-time progress tracking
- **Smart filtering** - Filter by team member (Person 1-3) and day of week
- **Time estimation** - Built-in time tracking for each task

![Daily Task Management](https://github.com/user-attachments/assets/0a61f750-1893-4642-88b7-b9f51e68f641)

### 📝 Template Organization
- **Marketing template library** - Organized social media, email, and press templates
- **Easy content selection** - Browse and select from 50+ ready-to-use templates
- **Template generation** - Create customized content from template frameworks
- **Category organization** - Templates grouped by type (social, email, press)

### 👥 Team Coordination
- **Role-based access** - Team roles loaded from O-team-roles-guide.md
- **Meeting management** - Log team meetings and track action items
- **Status updates** - Real-time team member status and current tasks
- **Communication hub** - Centralized coordination protocols

### 📤 Export & Integration
- **Multiple formats** - Export to JSON, CSV, and Markdown
- **External tool support** - Integration preparation for:
  - Google Workspace
  - Asana
  - Slack
  - Mailchimp
  - Buffer
- **Data portability** - All marketing data exportable for external use

## 🛠 Technical Architecture

### Backend (Node.js + Express)
- **Markdown parsing engine** - Processes existing documentation files
- **RESTful API** - Clean endpoints for dashboard, tasks, templates, team, and export
- **File-based data** - Leverages existing markdown files as data source
- **Security middleware** - Helmet, CORS, and input validation
- **Vercel serverless** - Optimized for serverless function deployment

### Frontend (Vanilla JavaScript)
- **Responsive design** - Mobile-friendly interface with CSS Grid
- **Progressive enhancement** - Works without JavaScript for basic functionality
- **Tab-based navigation** - Clean, intuitive interface design
- **Real-time updates** - Dynamic content loading and state management
- **CDN delivery** - Static assets served via Vercel Edge Network

### Deployment & Hosting
- **Vercel Platform** - Serverless functions with automatic scaling
- **Edge Network** - Global CDN for fast content delivery
- **Automatic HTTPS** - SSL certificates automatically provisioned
- **Git Integration** - Automatic deployments on push to main branch
- **Preview Deployments** - Every pull request gets a preview URL

### Data Processing
- **Intelligent parsing** - Extracts tasks, templates, and coordination data from markdown
- **Task extraction** - Parses checkboxes, time estimates, and day assignments
- **Template processing** - Organizes content by type and category
- **Progress tracking** - Calculates completion percentages and team metrics

## 📁 Project Structure

```
├── server/
│   ├── app.js                 # Main Express application
│   └── routes/                # API route handlers
│       ├── dashboard.js       # Dashboard data endpoints
│       ├── tasks.js           # Task management endpoints
│       ├── templates.js       # Template organization endpoints
│       ├── team.js           # Team coordination endpoints
│       └── export.js         # Export and integration endpoints
├── public/
│   ├── index.html            # Main application interface
│   ├── css/                  # Stylesheets
│   └── js/                   # Frontend JavaScript
├── src/
│   └── parsers/
│       └── MarkdownParser.js # Core markdown processing engine
└── Marketing Documentation/   # Existing campaign files (parsed by app)
    ├── DAILY-TASK-SYSTEM.md
    ├── PROJECT-DASHBOARD.md
    ├── PERFORMANCE-DASHBOARD.md
    ├── J-templates-examples.md
    ├── K-newsletter-templates.md
    ├── L-press-release-template.md
    ├── O-team-roles-guide.md
    └── TEAM-COORDINATION.md
```

## 🚀 Quick Start

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Access the Application
- **Dashboard**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **Default Port**: 3000 (configurable via PORT environment variable)

### API Endpoints
- `GET /api/dashboard/overview` - Campaign overview data
- `GET /api/tasks/daily` - Daily tasks for all team members
- `GET /api/templates` - Marketing template library
- `GET /api/team/coordination` - Team coordination protocols
- `GET /api/export/templates/json` - Export templates as JSON

## 💡 Usage

### For Team Coordinators
1. **Start with the Dashboard** - Get overview of campaign status
2. **Check team progress** - Monitor individual and overall task completion
3. **Update metrics** - Input daily performance data
4. **Export reports** - Generate status reports for stakeholders

### For Team Members
1. **Review your tasks** - Filter tasks by your role (Person 1-3)
2. **Track progress** - Check off completed tasks throughout the day
3. **Use templates** - Browse and apply marketing templates
4. **Stay coordinated** - Use team coordination features for communication

### For Campaign Analysis
1. **Export data** - Download campaign data in multiple formats
2. **Integration setup** - Prepare data for external productivity tools
3. **Performance tracking** - Monitor metrics and adjust strategy

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=development
PORT=3000
APP_NAME="Neural Wars Marketing Automation"
DOCS_PATH=./
EXPORT_PATH=./exports
```

### File Paths
The application automatically reads from existing markdown files in the repository root. No additional configuration required for basic operation.

## 🌟 Key Benefits

### Automation
- **Eliminates manual task tracking** - Tasks automatically loaded from documentation
- **Reduces coordination overhead** - Centralized team communication
- **Streamlines content creation** - Template-based content generation

### Consistency
- **Brand alignment** - All templates follow established voice and guidelines
- **Process standardization** - Consistent workflow execution across team
- **Quality control** - Built-in templates ensure messaging consistency

### Accountability
- **Progress visibility** - Real-time task completion tracking
- **Team transparency** - Clear role assignments and status updates
- **Performance metrics** - Data-driven campaign optimization

### Scalability
- **Export functionality** - Easy data migration to enterprise tools
- **API architecture** - Ready for future integrations and enhancements
- **Modular design** - Components can be extended or replaced independently

## 🚀 Future Enhancements

### Planned Features
- **AI-powered content generation** - Automated template customization
- **Advanced analytics** - Predictive performance modeling
- **Real-time notifications** - Slack/email alerts for key events
- **Mobile app** - Native iOS/Android applications
- **Advanced integrations** - Direct API connections to marketing platforms

### Integration Roadmap
- **Phase 1**: Google Workspace, Asana, Slack
- **Phase 2**: Mailchimp, Buffer, Hootsuite  
- **Phase 3**: Amazon Advertising API, Facebook Ads Manager
- **Phase 4**: Advanced analytics and AI features

## 📞 Support

This application leverages the comprehensive marketing documentation already created for "The Neural Wars: Fractured Code" campaign. All templates, workflows, and coordination protocols are based on the existing implementation guides.

The Neural Wars consciousness revolution starts with organized, automated marketing execution!