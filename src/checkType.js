import('node:process').then(({ stdout }) => {
  try {
    require.main
  } catch {
    stdout.write('module')
    return 'module'
  }

  try {
    import.meta
  } catch {
    stdout.write('commonjs')
    return 'commonjs'
  }
})
