const { spawn } = require('child_process');
const fs = require('fs')

function exportAndBuild() {
	const exporter = spawn('expo', ['export', '--public-url', publicURL, '--dev']);
	exporter.stdout.on('data', (chunk) => {
		console.log('##EXPORT## ' + new String(chunk))
	});
	exporter.stderr.on('data', (data) => {
		console.error('##EXPORT## ' + new String(data))
	})
	exporter.on('close', (code) => {
		buildApk(true, code)
	});
}

function buildApk(exported, code) {
	if (exported) console.log(`exporter process exited with code ${code}`);
	if (!exported || exported && code == 0) {
		if (publicURL.includes('localhost')) {
			process.chdir('./dist')

			pythonServer = spawn('python3', ['-m', 'http.server', '8000']);
			pythonServer.stdout.on('data', (chunk) => {
				console.log('##PSERVER## ' + new String(chunk))
			});
			pythonServer.stderr.on('data', (data) => {
				console.error('##PSERVER## ' + new String(data))
			})
			process.chdir('..')
		}
		const turtleBuilder = spawn('turtle', [
			'build:android',
			'--type', 'apk',
			'--keystore-alias', data.KEYSTORE_ALIAS,
			'--keystore-path', data.KEYSTORE_PATH,
			'--public-url', `${publicURL}/android-index.json`,
			'--build-dir', './build',
			allowHTTP ? '--allow-non-https-public-url' : ''
		]);

		turtleBuilder.stdout.on('data', (data) => {
			console.log('##BUILD## ' + new String(data))
		})

		turtleBuilder.stderr.on('data', (data) => {
			console.error('##BUILD## ' + new String(data))
		})

		turtleBuilder.on('close', (code) => {
			if (code == 0) console.log('##Success##\nApk builded :)')
			else {
				console.error('Error building :( ')
				pythonServer.kill()
				process.exit(-1)
			}
			if (pythonServer) pythonServer.kill()
			process.exit(0)
		})
	}
}

const data = JSON.parse(fs.readFileSync('./expo_data.json'))
console.log(data)

process.env.EXPO_ANDROID_KEYSTORE_PASSWORD = data.EXPO_ANDROID_KEYSTORE_PASSWORD
process.env.EXPO_ANDROID_KEY_PASSWORD = data.EXPO_ANDROID_KEY_PASSWORD
process.env.EXPO_PASSWORD = data.EXPO_PASSWORD
process.env.EXPO_USERNAME = data.EXPO_USERNAME

const publicURL = data.PUBLIC_URL || 'http://localhost:8000'
const allowHTTP = publicURL ? (publicURL.includes('http://') ? true : false) : true
const isExpoManifestUrl = publicURL.includes('https://exp.host')
var pythonServer = null

if (fs.existsSync('./dist')) {
	fs.rmdirSync('./dist', { recursive: true })
}
if (fs.existsSync('./ios')) {
	fs.rmdirSync('./ios', { recursive: true })
}
if (fs.existsSync('./android')) {
	fs.rmdirSync('./android', { recursive: true })
}

if (isExpoManifestUrl) buildApk(false, 0)
else exportAndBuild()