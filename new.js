function streamingMicRecognize(encoding, sampleRateHertz, languageCode) {

    const recorder = require('node-record-lpcm16');
    const speech = require('@google-cloud/speech');
    const client = new speech.SpeechClient();
    
    const request = {
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
      interimResults: true, 
    };
  
    const recognizeStream = client
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', data =>
        process.stdout.write(
          data.results[0] && data.results[0].alternatives[0]
            ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
            : `\n\nReached transcription time limit, press Ctrl+C\n`
        )
      );
  
    recorder
      .record({
        sampleRateHertz: sampleRateHertz,
        threshold: 0,
        verbose: false,
        recordProgram: 'sox', 
        silence: '10.0',
      })
      .stream()
      .on('error', console.error)
      .pipe(recognizeStream);
  
    console.log('Listening, press Ctrl+C to stop.');
  }
  
require(`yargs`) 
  .demand(1)
  .command(
    `listen`,
    `Detects speech in a microphone input stream. This command requires that you have SoX installed and available in your $PATH. See https://www.npmjs.com/package/node-record-lpcm16#dependencies`,
    {},
    opts =>
      streamingMicRecognize(
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .options({
    encoding: {
      alias: 'e',
      default: 'LINEAR16',
      global: true,
      requiresArg: true,
      type: 'string',
    },
    sampleRateHertz: {
      alias: 'r',
      default: 16000,
      global: true,
      requiresArg: true,
      type: 'number',
    },
    languageCode: {
      alias: 'l',
      default: 'pt-BR',
      global: true,
      requiresArg: true,
      type: 'string',
    },
  })
.wrap(120)
.strict().argv;