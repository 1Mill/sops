const fs = require('fs')
const { DecryptCommand, KMSClient } = require('@aws-sdk/client-kms')
const { fetchNodeEnv } = require('./fetchNodeEnv')
const { walkAndDecrypt } = require('./walkAndDecrypt')

class Sops {
	constructor({
		accessKeyId = fetchNodeEnv('MILL_SOPS_AWS_ACCESS_KEY_ID') || fetchNodeEnv('AWS_ACCESS_KEY_ID') || fetchNodeEnv('AWS_ACCESS_KEY'),
		endpoint = fetchNodeEnv('MILL_SOPS_AWS_ENDPOINT') || fetchNodeEnv('AWS_ENDPOINT'),
		file = fetchNodeEnv('MILL_SOPS_FILE') || fetchNodeEnv('NODE_ENV') === 'production' ? 'prod.secrets.sops.json' : 'dev.secrets.sops.json',
		region = fetchNodeEnv('MILL_SOPS_AWS_REGION') || fetchNodeEnv('AWS_REGION'),
		secretAccessKey = fetchNodeEnv('MILL_SOPS_AWS_SECRET_ACCESS_KEY') || fetchNodeEnv('AWS_SECRET_ACCESS_KEY'),
		sessionToken = fetchNodeEnv('AWS_SESSION_TOKEN'),
	}) {
		// * Credentials
		this.accessKeyId = accessKeyId
		if (!this.accessKeyId) throw new Error('AWS "accessKeyId" is required')

		this.region = region
		if (!this.region) throw new Error('AWS "region" is required')

		this.secretAccessKey = secretAccessKey
		if (!this.secretAccessKey) throw new Error('AWS "secretAccessKey" is required')

		this.sessionToken = sessionToken

		// * Optional for development purposes (e.g. localstack)
		this.endpoint = endpoint

		// * AWS Connection
		this.client = undefined

		// * Outputs
		this.file = file
		if (!this.file) throw new Error('SOPS "file" is required')

		this.secrets = {}

		// * Run immediately
		this._buildSecrets
	}

	async _buildSecrets() {
		if (Object.keys(this.secrets).length !== 0) return

		if (typeof this.client === 'undefined') {
			this.client = new KMSClient({
				credentials: {
					accessKeyId: this.accessKeyId,
					secretAccessKey: this.secretAccessKey,
					sessionToken: this.sessionToken,
				},
				endpoint: this.endpoint,
				region: this.region,
			})
		}

		const tree = JSON.parse(fs.readFileSync(this.file, 'utf-8').toString())

		let key = null
		for (const kms of tree.sops.kms) {
			if (!kms.enc) continue

			const command = new DecryptCommand({ CiphertextBlob: Buffer.from(kms.enc, 'base64') })
			const response = await this.client.send(command)
			key = response.Plaintext // * Returns as base64

			if (key) break
		}

		this.secrets = walkAndDecrypt({ tree, key })
	}

	async decrypt(name) {
		await this._buildSecrets()
		return name ? this.secrets[name] : this.secrets
	}
}

module.exports = { Sops }
