const fs = require('fs')
const sopsDecode = require('sops-decoder')
const { DecryptCommand, KMSClient } = require('@aws-sdk/client-kms')
const { decryptScalar } = require('./decryptScalar')

const fetchNodeEnv = (name) => {
	return process && process.env && process.env[name]
}

const main = async () => {
	const data = await sopsDecode.decodeFile('./dev.secrets.sops.json')
	console.log(JSON.stringify(data, null, 2))
}

class Sops {
	constructor({
		accessKeyId = fetchNodeEnv('MILL_SOPS_AWS_ACCESS_KEY_ID'),
		endpoint = fetchNodeEnv('MILL_SOPS_AWS_ENDPOINT'),
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
	}

	async decrypt() {
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

		const content = fs.readFileSync('./dev.secrets.sops.json', 'utf-8')
		const tree = JSON.parse(content.toString())
		const { sops } = tree

		const kmsTree = tree.sops.kms

		let key = null
		for (const entry of kmsTree) {
			if (!entry.enc) continue

			console.log(entry)

			const command = new DecryptCommand({
				CiphertextBlob: Buffer.from(entry.enc, 'base64'),
				EncryptionContext: entry.context || {},
			})
			const response = await this.client.send(command)
			const temp = response.Plaintext
			key = temp

			if (key) break
		}
		console.log(key)

		const result = {}
		Object.entries(tree).forEach(([k, v]) => {
			if (k === 'sops') return
			result[k] = decryptScalar({ authKey: key, key: k, value: v })
		})
		console.log(result)
	}
}

// main()

const sops = new Sops({})

sops.decrypt()
