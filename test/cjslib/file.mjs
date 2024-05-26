import { stdout } from 'node:process'
import { moduleType } from 'node-module-type'

stdout.write(moduleType())
