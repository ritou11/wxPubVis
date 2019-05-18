/* eslint-disable no-console */
const netlify = require('netlify');
const path = require('path');
const secret = require('./secret');

const run = async (draft = false) => {
  try {
    const client = netlify.createClient({
      access_token: secret.netlify_key,
    });
    const site = await client.site(secret.netlify_site);

    const deploy = await site.createDeploy({
      dir: path.join(__dirname, './build'),
      draft,
      progress: console.log,
    });
    await deploy.waitForReady();
    console.log('Success');
  } catch (err) {
    console.error(err);
  }
};

if (secret.netlify_key && secret.netlify_site) {
  console.log('Start deploying to Netlify...');
  run(process.argv.includes('--draft'));
} else {
  console.log('Ignore deploying to Netlify');
}
