import through from 'through2';
import gutil from 'gulp-util';
import { PluginError } from 'gulp-util';
import request from 'request';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export default (options) => {

  const files = [];

  const stream = through.obj((file, encoding, next) => {
    files.push(file.path);
    next();
  }, (cb) => {

    const manifest = options.manifest;

    const repo = manifest && manifest.repository && /github\.com:?\/?([\w-]+)\/([\w-]+)/.exec(manifest.repository.url);

    // Constants
    const API_URL = 'https://api.github.com/repos';
    const REPO_URL = `${repo[1]}/${repo[2]}`;
    const TOKEN = options.token || process.env.GITHUB_TOKEN;
    const PLUGIN_NAME = 'gulp-octorelease';

    // Conf
    const headers = {
      'User-Agent': 'gulp-octorelease',
      'Authorization': `token ${TOKEN}`
    };

    const preRelease = {
      tag_name: options.tag || manifest && ('v' + manifest.version) || undefined,
      name: options.name || options.tag,
      body: options.body || options.tag,
      prerelease: true
    };

    const url = `${API_URL}/${REPO_URL}/releases`;

    request.post({ url, headers, json: preRelease }, (err, response, prerelease) => {
      if (err) throw new PluginError(PLUGIN_NAME, `Error generating prerelease: ${err}`);

      if (!prerelease.upload_url) throw new PluginError(PLUGIN_NAME, `Error getting upload_url, you proably already have a release with this version: ${err}`);

      const body = fs.readFileSync(files[0]);
      const uploadHeaders = { ...headers, 'Content-Type': 'application/zip' };
      const uploadUrl = `${prerelease.upload_url.split('{')[0]}?name=${options.assetName}`;

      request.post({ url: uploadUrl, headers: uploadHeaders, body }, (err, response, asset) => {
        if (err) throw new PluginError(PLUGIN_NAME, `Error uploading asset: ${err}`);

        const json = { prerelease: false };

        request.patch({ url: `${url}/${prerelease.id}`, headers, json }, (err, response, release) => {
          if (err) throw new PluginError(PLUGIN_NAME, `Error updating release: ${err}`);

          console.log(`Release successfully uploaded: ${prerelease.url}`);

          cb();

        });

      });

    });

  });

  stream.resume();
  return stream;

};
