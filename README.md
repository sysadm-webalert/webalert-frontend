# WebAlert Frontend
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sysadm-webalert_webalert-frontend&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sysadm-webalert_webalert-frontend)
## Overview
WebAlert is a smoothie app to monitoring your sites, with real-time alerts and detailed metrics, you'll always stay informed about the status of your sites. 

## Features
- **Website Status Monitoring**: Keep track of your site's uptime and downtime in real-time.
- **Performance Metrics**:  Monitor response times and gather critical performance data to ensure your site is running smoothly.
- **Custom Alerts**: Get notified instantly about outages or performance issues with customizable alert settings.
- **Multi-Organization Support**: Manage multiple organizations, each with their own independent site configurations and metrics.
- **Smoothly Interface**: Enjoy a sleek, responsive UI built with Vue 3 and Bootstrap for real-time log visualization and management.

## Installation

### Prerequisites
- Node 20

### Building local
1. Install required packages
   ```bash
   npm install
   ```
2. Run dev server
   ```bash
   npm run dev
   ```

### Building docker
1. Run docker compose dev
    ```sh
    docker compose --profile dev build
    docker compose --profile dev up -d
    ```

## Configuration
1. Set your API address backend as env variable.
     ```sh
    VITE_VUE_APP_API_BASE_URL
    ```

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support
For issues or feature requests, please open an issue in the [GitHub repository](https://github.com/sysadm-webalert/webalert-frontend/issues).

---
**WebAlert Agent** © 2024