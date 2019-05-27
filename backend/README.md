# wxPubVis/backend
[![Run Status](https://api.shippable.com/projects/5ce95fe1daf54c0007e97a4b/badge?branch=deploy)](https://app.shippable.com/github/ritou11/wxPubVis/dashboard)

> The backend of the project. The structure is copied from [colorana](https://github.com/ritou11/colorana).

## Structure
1. `crawler/`, wechat spider.
2. `backup/`, mongo data backup files.

## Usage
1. Build: `docker-compose build`
2. Run: `docker-compose up -d`
3. Backup: Keep running and `./dump.sh`
4. Restore: Keep running, put wePubVis.tar.gz in `backup/` and `./restore.sh`

## License
MIT
