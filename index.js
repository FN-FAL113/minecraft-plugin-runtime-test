// Author: FN-FAL113
// License: GNU GPL v3
const https = require('https')
const fsPromise = require('fs').promises
const fs = require('fs')
const childproc = require('child_process')

async function main() {
    try {
        if(!process.env.SERVER_VERSION) {
            console.error(`Missing "SERVER_VERSION" env variable value! Exiting process with code 1.`)
            
            process.exit(1)
        }

        const serverName = "paper"
        const serverVersion = process.env.SERVER_VERSION
        const serverBuild = await getLatestServerBuild(serverVersion)
        const serverJarFileName = `${serverName}-${serverVersion}-${serverBuild}.jar`
        const serverJarUrl = `https://api.papermc.io/v2/projects/paper/versions/${serverVersion}/builds/${serverBuild}/downloads/${serverJarFileName}`

        const slimefunJarUrl = 'https://blob.build/dl/Slimefun4/Dev/1156'

        await fsPromise.writeFile('server/eula.txt', "eula=true").catch((err) => console.log("error writing contents to eula.txt: " + err))

        await downloadJar(serverJarUrl, 'server/', serverJarFileName)

        await downloadJar(slimefunJarUrl, 'server/plugins/' , 'Slimefun4-Dev.jar')

        runServer(serverJarFileName)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

function getLatestServerBuild(serverVersion) {
    return new Promise((resolve, reject) => {
        const url = `https://api.papermc.io/v2/projects/paper/versions/${serverVersion}/builds` 

        let jsonStream = ''

        https.get(url, (res) => {
            res.on('data', (chunk) => {
                jsonStream += chunk // patching up every chunks of byte data
            })

            res.on('end', () => {
                if(res.statusCode !== 200) { 
                    reject("Failed to fetch build data with status message: " + res?.statusMessage)
                } else {
                    const json = JSON.parse(jsonStream) // parse stream directly instead of writing stream to a file

                    resolve(json.builds[json.builds.length - 1].build) // retrieve last index of builds array
                }
            })
        })
    })
}

function downloadJar(url, dir, jarFile) {
    return new Promise((resolve, reject) => {
        let receivedBytes = 0

        https.get(url, (res) => {
            res.pipe(fs.createWriteStream(dir + jarFile)) // pipe readable stream to a writeable stream
            
            res.on('data', (chunk) => {
                receivedBytes += chunk.length // patching up every chunks of byte length to check download progress
                
                console.log(`Downloading "${jarFile}": ` + (receivedBytes / 1000000).toFixed(2) + "mb / " + (res.headers['content-length'] / 1000000).toFixed(2) + "mb")
            })

            res.on('end', () => {
                if(res.statusCode !== 200){
                    console.log("\nFailed to download server jar file!")
                    console.log("\nStatus code: " + res.statusCode)
                    console.log("\nStatus message: " + res?.statusMessage)

                    reject()
                } else {
                    console.log(`\nSuccessfully downloaded "${jarFile}"!`)

                    resolve()
                }
            })
        })
    })
}

function runServer(jarFile) {
    console.log("Jar file execution in progress!")

    const child = childproc.spawn("java", ['-jar', `${jarFile}`, '--nogui'], { cwd:"server/" })
    
    child.stdout.on('data', (data) => {
        console.log(data.toString())
    })

    child.stderr.on('data', (data) => {
        console.log(data.toString())      
    })
}

main()
