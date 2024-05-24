import { stdout } from 'node:process'
import { moduleType } from 'module-type'

stdout.write(await moduleType())
