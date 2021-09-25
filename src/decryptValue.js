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

	decryptor = crypto.createDecipheriv('aes-256-gcm', authKey, Buffer.from(iv, 'base64'))
	decryptor.setAAD(Buffer.from(`${key}:`))
	decryptor.setAuthTag(Buffer.from(tag, 'base64'))

	const cleartext = decryptor.update(Buffer.from(data, 'base64'), undefined, 'utf-8') + decryptor.final('utf-8')

	console.log('!!!!!!!!!!!!!!!!!!!')
	console.log(cleartext)
	console.log('!!!!!!!!!!!!!!!!!!!')



	console.log(decryptor)
	return 'aaaaaaaaaaaaaaaaaaaaaaaa'
}

module.exports = { decryptValue }
