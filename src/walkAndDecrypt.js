const { decryptScalar } = require('./decryptScalar')

const decryptValue = ({ aad, key, value }) => {
	if (Array.isArray(value)) return value.map(v => decryptValue({ aad, key, value: v }))
	if (typeof value === 'object') return walkAndDecrypt({ aad, key, tree: value })
	return decryptScalar({ aad, key, value })
}

const walkAndDecrypt = ({ aad = '', key, tree }) => {
	const r = {}
	Object.entries(tree).forEach(([k, v]) => {
		if (k === 'sops') return
		r[k] = decryptValue({ aad: `${aad}${k}:`, key, value: v })
	})
	return r
}

module.exports = { walkAndDecrypt }
