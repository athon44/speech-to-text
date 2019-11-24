function streamingMicRecognize(encoding, sampleRateHertz, languageCode) {
    // [START speech_transcribe_streaming_mic]
    const recorder = require('node-record-lpcm16');
  
    // Imports the Google Cloud client library
    const speech = require('@google-cloud/speech');
  
    // Creates a client
    const client = new speech.SpeechClient();
    
    const request = {
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
      interimResults: true, // If you want interim results, set this to true
    };
  
    // Create a recognize stream
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
  
    // Start recording and send the microphone input to the Speech API
    recorder
      .record({
        sampleRateHertz: sampleRateHertz,
        threshold: 0,
        verbose: false,
        recordProgram: 'sox', // Try also "arecord" or "sox"
        silence: '10.0',
      })
      .stream()
      .on('error', console.error)
      .pipe(recognizeStream);
  
    console.log('Listening, press Ctrl+C to stop.');
    // [END speech_transcribe_streaming_mic]
  }
  
require(`yargs`) // eslint-disable-line
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