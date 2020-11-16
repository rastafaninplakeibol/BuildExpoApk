const { spawn } = require('child_process');
const fs = require('fs')

const EXPO_ANDROID_KEYSTORE_PASSWORD = 'your_expo_android_keystore_password'
const EXPO_ANDROID_KEY_PASSWORD = 'your_expo_android_key_password'
const EXPO_PASSWORD = 'your_expo_account_password'
const EXPO_USERNAME = 'your_expo_account_username'
const KEYSTORE_ALIAS = 'keystore_alias'
const KEYSTORE_PATH = 'keystore_path'


process.env.EXPO_ANDROID_KEYSTORE_PASSWORD = EXPO_ANDROID_KEYSTORE_PASSWORD
process.env.EXPO_ANDROID_KEY_PASSWORD = EXPO_ANDROID_KEY_PASSWORD
process.env.EXPO_PASSWORD = EXPO_PASSWORD
process.env.EXPO_USERNAME = EXPO_USERNAME
if(fs.existsSync('./dist')) {
	fs.rmdirSync('./dist', {recursive: true})
}

const exporter = spawn('expo', ['export', '--public-url', 'http://127.0.0.1:8000', '--dev']);

exporter.stdout.on('data', (chunk) => {
	console.log('##EXPORT## ' + new String(chunk))
});

exporter.stderr.on('data', (data) => {
	console.error('##EXPORT## ' + new String(data))
})

exporter.on('close', (code) => {
	console.log(`exporter process exited with code ${code}`);
	if(code == 0) {
		process.chdir('./dist')
		const pythonServer = spawn('python3', ['-m', 'http.server', '8000']);
		pythonServer.stdout.on('data', (chunk) => {
			console.log('##PSERVER## ' + new String(chunk))
		});
		pythonServer.stderr.on('data', (data) => {
			console.error('##PSERVER## ' + new String(data))
		})
		process.chdir('..')
		const turtleBuilder = spawn('turtle', [
			'build:android', 
			'--type', 'apk', 
			'--keystore-alias', KEYSTORE_ALIAS,  
			'--keystore-path', KEYSTORE_PATH, 
			'--public-url', 'http://127.0.0.1:8000/android-index.json',
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
				process.exit(-1)
			}
			pythonServer.kill()
			process.exit(0)
		})
	}
});
