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

|                 | Required | Default                                                                                                                    | Notes                                                                                  |
|-----------------|----------|----------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| accessKeyId     | yes      | process.env.MILL_SOPS_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY                     |                                                                                        |
| endpoint        |          | process.env.MILL_SOPS_AWS_ENDPOINT                                                                                         | Good for local development environment when using Localstack (or other AWS simulators) |
| file            |          | process.env.MILL_SOPS_FILE \|\| process.env.NODE_ENV === 'production' ? 'prod.secrets.sops.json' : 'dev.secrets.sops.json' |                                                                                        |
| region          | yes      | process.env.MILL_SOPS_AWS_REGION || process.env.AWS_REGION                                                                 |                                                                                        |
| secretAccessKey | yes      | process.env.MILL_SOPS_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY                                           |                                                                                        |
| sessionToken    |          | process.env.AWS_SESSION_TOKEN                                                                                              |                                                                                        |
