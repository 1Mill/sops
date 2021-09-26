const fs = require('fs')
const { DecryptCommand, KMSClient } = require('@aws-sdk/client-kms')
const { fetchNodeEnv } = require('./fetchNodeEnv')
const { walkAndDecrypt } = require('./walkAndDecrypt')

class Sops {
	constructor({
		accessKeyId = fetchNodeEnv('MILL_SOPS_AWS_ACCESS_KEY_ID'),
		endpoint = fetchNodeEnv('MILL_SOPS_AWS_ENDPOINT'),
		file = fetchNodeEnv('MILL_SOPS_FILE') || fetchNodeEnv('NODE_ENV') === 'production' ? 'prod.secrets.sops.json' : 'dev.secrets.sops.json',
		region = fetchNodeEnv('MILL_SOPS_AWS_REGION'),
		secretAccessKey = fetchNodeEnv('MILL_SOPS_AWS_SECRET_ACCESS_KEY'),
	}) {
		// * Credentials
		this.accessKeyId = accessKeyId
		this.region = region
		this.secretAccessKey = secretAccessKey

		// * Optional for development purposes (e.g. localstack)
		this.endpoint = endpoint

		// * AWS Connection
		this.client = undefined

		// * Outputs
		this.file = file
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
