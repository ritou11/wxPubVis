# wxPubAnal/backend
> The backend of the project. The structure is copied from [colorana](https://github.com/ritou11/colorana).

## Structure
1. `crawler/`, wechat spider.
2. `backup/`, mongo data backup files.

## Usage
1. Build: `docker-compose build`
2. Run: `docker-compose up -d`
3. Backup: Keep running and `./dump.sh`
4. Restore: Keep running, put wePubAnal.tar.gz in `backup/` and `./restore.sh`

## License
MIT
