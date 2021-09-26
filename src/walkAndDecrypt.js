const { decryptScalar } = require('./decryptScalar')

const walkAndDecrypt = ({ aad = '', key, tree }) => {
	const decryptValue = ({ aad, value }) => {
		if (Array.isArray(value)) return value.map(v => decryptValue({ aad, value: v }))
		if (typeof value === 'object') return walkAndDecrypt({ aad, key, tree: value })
		return decryptScalar({ aad, key, value })
	}

	const r = {}
	Object.entries(tree).forEach(([k, v]) => {
		if (k === 'sops') return
		r[k] = decryptValue({ aad: `${aad}${k}:`, value: v })
	})
	return r
}

module.exports = { walkAndDecrypt }
