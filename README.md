# gulp-octorelease
Publish releases & upload assets with gulp

# Installation
```zsh
npm i --save-dev gulp-octorelease
```

# Usage

Import it:
```javascript
import release from 'gulp-octorelease';
```

Or if you are using CommonJS modules, require it like this:
```javascript
const release = require('gulp-octorelease').default;
```

EX:
```javascript

const manifest = require('package.json');

gulp.task('github', function(){
	gulp.src(pathToZipFile)
	.pipe(release({
		token: process.env.GITHUB_TOKEN,
		tag: 'v' + manifest.version,
		name: manifest.name + ' v' + manifest.version,
		body: 'New ' + manifest.name + ' release v' + manifest.version + '!',
		assetName: 'yourAssetName.zip',
		manifest: manifest
	}));
});

gulp.task('release', ['your-zip-task', 'github']);

```

# TODO

- Better error handling
- Consider using async/await

Cheers 🤖
