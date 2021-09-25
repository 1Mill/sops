const crypto = require('crypto')

const decryptValue = ({ authKey, key, value }) => {
	const [
		_,
		data,
		iv,
		tag,
		type,
	] = value
		.match(/^ENC\[AES256_GCM,data:(.+),iv:(.+),tag:(.+),type:(.+)\]/,)
		.map(item => Buffer.from(item, 'base64'))

	decryptor = crypto.createDecipheriv('aes-256-gcm', authKey, iv)
	decryptor.setAuthTag(tag)
	decryptor.setAAD(Buffer.from(`${key}:`))

	const cleartext = decryptor.update(data, undefined, 'utf-8') + decryptor.final('utf-8')

	console.log('!!!!!!!!!!!!!!!!!!!')
	console.log(cleartext)
	console.log('!!!!!!!!!!!!!!!!!!!')



	console.log(decryptor)
	return 'aaaaaaaaaaaaaaaaaaaaaaaa'
}

module.exports = { decryptValue }
