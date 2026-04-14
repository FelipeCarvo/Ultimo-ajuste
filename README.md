<<<<<<< HEAD
# siecon-req

![](https://img.shields.io/badge/Ionic-v7.2.0-blue) ![](https://img.shields.io/badge/Capacitor-v7.0.0-black) ![](https://img.shields.io/badge/Angular-19.1.5-red) ![](https://img.shields.io/badge/Node-v20.18.2-green)

## :electric_plug: Getting Started

Instale o nvm.

```terminal
nvm install 20.18.2
nvm use 20.18.2
git clone https://github.com/Poliview-Siecon/RequisicaoMobile.git
cd RequisicaoMobile
npm install --global yarn
npm i -g @ionic/cli
npm install @capacitor/core 
npm install @capacitor/cli
'npm i' ou 'yarn'
```

## :zap: Run

* no browser: `npm start`
* no android: `ionic capacitor run android`
* no ios: `ionic capacitor run ios`

## :rocket: Build

### - IOS

* `npm run generate_apk:ios`
* Confirmar certificados
* Alterar a versao no XCode
* Confirmar Bundle com.siecon.req.app
* Confirmar dispositivo como any ios Device (arm64)
* fazer o archive e upload pra App Store

### - Android

* `npm run generate_apk:android`
* Pegar apk no output em ``/android/app/build/outputs/apk``

### - Warning

* :warning:``Certfique-se que tem a dependencia `capacitor-resources` para funcionar o run generate_apk`` e gerar splashScreen com capacitor-resources

## :fearful: Problemas e Soluções(macOs m1)

### - Solução IOS

Pod install - failed!

```sh
sudo arch -x86_64 gem install ffi
arch -x86_64 pod install
```

### - Solução Android

package android.support.v4.content does not exist!

```sh
npm install jetifier
npx jetify
npx cap sync android
```

## Publicar Apps

### Android

```sh
npx cap sync
npm run generate_apk:android
npm run pos_build_android
npx cap open android
```

Dentro do Android Studio procure pelo arquivo **"build.gradle"** módulo android.app (android/app/build.gradle).

Procure por **versionName** e modifique de acordo com a versão atual como o usuário enxerga.

Procure por **versionCode** e modifique de acordo com a versão atual, mas de forma que o site do google enxerga.

Depois acesse o menu Build->"Generate Signed Bundle / APK"

Siga os passos na tela.

O arquivo será gerado na pasta {raizdoprojeto}/android/app/release

#### IOS

```sh
npx cap sync
npm run generate_apk:ios
npx cap open ios
```

Após abrir o xcode garantir que as permissões abaixo estão na lista do arquivo Info.plist. [Clique aqui para ver como chegar lá](https://capacitorjs.com/docs/ios/configuration)

* NSCameraUsageDescription (Privacy - Camera Usage Description)
* NSPhotoLibraryAddUsageDescription (Privacy - Photo Library Additions Usage Description)
* NSPhotoLibraryUsageDescription (Privacy - Photo Library Usage Description)

Selecione a opção "Any IOS Device" na lista dos dispositivos.

No lado esquerdo clique duplo em App, na aba **"General"**, procure por **Version** e **Build** esses dois campos devem ser únicos em relação ao site da Apple. 

Depois selecione o menu Product->Archive, siga os passos na tela.

