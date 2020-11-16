const { spawn } = require('child_process');
const fs = require('fs')

process.env.EXPO_ANDROID_KEYSTORE_PASSWORD = 'yourkeystorepassword'
process.env.EXPO_ANDROID_KEY_PASSWORD = 'yourkeypassword'
process.env.EXPO_PASSWORD = 'yourexpopassword'
process.env.EXPO_USERNAME = 'yourexpousername'

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
			'--keystore-alias', 'yourkeystorealias',  
			'--keystore-path', 'path_to_jks_file', 
			'--public-url', 'http://127.0.0.1:8000/android-index.json',
		]);

		turtleBuilder.stdout.on('data', (data) => {
			console.log('##BUILD## ' + new String(data))
		})

		turtleBuilder.stderr.on('data', (data) => {
			console.error('##BUILD## ' + new String(data))
		})

		turtleBuilder.on('close', (code) => {
			if (code == 0) console.log('BUILDATO CON SUCCESSOOOOO')
			else {
				console.error('Errore nella build :( ')
				process.exit(-1)
			}
			pythonServer.kill()
			process.exit(0)
		})
	}
});
