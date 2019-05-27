# wxPubVis/backend
[![Run Status](https://api.shippable.com/projects/5ce95fe1daf54c0007e97a4b/badge?branch=deploy)](https://app.shippable.com/github/ritou11/wxPubVis/dashboard)

> The backend of the project. The structure is copied from [colorana](https://github.com/ritou11/colorana).

## Structure
1. `crawler/`, wechat spider.
2. `backup/`, mongo data backup files.
3. `server/`, GraphQL server.
4. `conf/`, config file for deploy/ssl.

## Usage
1. Build: `docker-compose build`
2. Run: `docker-compose up -d`
3. Backup: Keep running and `./dump.sh`
4. Export json: Keep running and `./export.sh`
5. Restore: Keep running, put wePubVis.tar.gz in `backup/` and `./restore.sh`
6. Deploy: Ensure the content in `deploy.sh` and `docker-compose-deploy.yml`, then exec the former

## License
MIT
