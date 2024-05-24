const { stdout } = require('node:process')
const { moduleType } = require('module-type')
const main = async () => {
  stdout.write(await moduleType())
}

main()
