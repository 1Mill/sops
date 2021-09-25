const crypto = require('crypto')

const decryptValue = ({ authKey, key, value }) => {
	// ! Ordering is important
	const [
		_,
		data,
		iv,
		tag,
		type,
	] = value.match(/^ENC\[AES256_GCM,data:(.+),iv:(.+),tag:(.+),type:(.+)\]/,)

	const dataBase64 = Buffer.from(data, 'base64')
	const ivBase64 = Buffer.from(iv, 'base64')
	const tagBase64 = Buffer.from(tag, 'base64')

	decryptor = crypto.createDecipheriv('aes-256-gcm', authKey, ivBase64)
	decryptor.setAAD(Buffer.from(`${key}:`))
	decryptor.setAuthTag(tagBase64)

	const cleartext = decryptor.update(dataBase64, undefined, 'utf-8') + decryptor.final('utf-8')

	console.log('!!!!!!!!!!!!!!!!!!!')
	console.log(cleartext)
	console.log('!!!!!!!!!!!!!!!!!!!')



	console.log(decryptor)
	return 'aaaaaaaaaaaaaaaaaaaaaaaa'
}

module.exports = { decryptValue }
