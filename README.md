# Minecraft Plugin Runtime Test
Github action for testing minecraft plugins initialization during server load on different versions of paper server.
![image](https://github.com/FN-FAL113/minecraft-plugin-runtime-test/assets/88238718/5086ee38-b1a3-4860-961a-1929124db85c)


### How it works
#### Prerequisite Steps
1. Checkout actions repository
2. Download build artifact from previous workflow build step
3. Set up Java 17
4. Setup Node 16
5. Execute index.js file
#### index.js
1. Create and initialize ```eula.txt```
2. Fetch latest server build
3. Download server jar through https get request based from inputs data
4. Download slimefun jar
5. Run Server

### Usage
- Create an action file inside ```./github/workflows``` in the scope of your plugin repository and configure the steps if necessary:
```yml
name: Build with Maven and Do Runtime Test

on:
  workflow_dispatch:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
    
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v2.3.3
      
    - name: Set up JDK 16
      uses: actions/setup-java@v1.4.3
      with:
        java-version: 16
        
    - name: Maven Build
      run: mvn clean package --file pom.xml
      
    - name: Upload the artifact
      uses: actions/upload-artifact@v3
      with:
        name: artifact-${{ github.event.number }}
        path: 'target/FNAmplifications*.jar' # Change this according to the location and filename of your packaged jar, you may use wildcards
  
  runtime-test:
    name: Plugin Runtime Test 
    needs: [build]
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - mcVersion: '1.16.5'
            javaVersion: '16'
          - mcVersion: '1.17.1'
            javaVersion: '17'
          - mcVersion: '1.18.2'
            javaVersion: '18'
          - mcVersion: '1.19.4'
            javaVersion: '19'
          - mcVersion: '1.20.1'
            javaVersion: '20'  
    
    steps:        
      - uses: FN-FAL113/minecraft-plugin-runtime-test@v1.1.2 # specify action version, use latest as possible
        with:
          server-version: ${{ matrix.mcVersion }}
          java-version: ${{ matrix.javaVersion }}
          artifact-name: artifact-${{ github.event.number }}
```

### Plugins Included by Default During Runtime
- Slimefun

Suggestions are open for plugins that depends on other plugins. This will be based off from a resource file soon in order to accomomdate more plugins or so this repo can be forked to support your plugins.
