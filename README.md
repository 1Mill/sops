# @1mill/sops

```bash
npm install @1mill/sops
```

```node
const { Sops } = require('@1mill/sops')

const sops = new Sops({})

exports.handler = async (cloudevent, ctx) => {
  ctx.callbackWaitsForEmptyEventLoop = false

  const allMySecrets = await sops.decrypt()
  const aSingleSecret = await sops.decrypt('my secret name')

  return {
    allMySecrets,
    aSingleSecret,
  }
}
```
