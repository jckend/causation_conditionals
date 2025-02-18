// import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice'
import externalHtml from '@jspsych/plugin-external-html'
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response'
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychHtmlSliderReponse from '@jspsych/plugin-html-slider-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'


import { debugging, getUserInfo, mockStore, prolificCC, prolificCUrl } from './globalVariables'
import { saveTrialDataComplete, saveTrialDataPartial } from './lib/databaseUtils'

// import type { jsPsychSurveyMultiChoice, Task, TrialData } from './project'
import type { SaveableDataRecord } from '../types/project'
import type { DataCollection } from 'jspsych'

/* Alternatively
 * type JsPsychInstance = ReturnType<typeof initJsPsych>
 * type JsPsychGetData = JsPsychInstance['data']['get']
 * export type JsPsychDataCollection = ReturnType<JsPsychGetData>
 */

const debug = debugging()
const mock = mockStore()

type Task = 'response' | 'fixation' | 'question' | 'feedback'
type Response = 'left' | 'right'
type KeyboardResponse = 'ArrowLeft' | 'ArrowRight'

interface TrialData {
  task: Task
  response: Response
  saveIncrementally: boolean
}

const debuggingText = debug ? `<br /><br />redirect link : ${prolificCUrl}` : '<br />'
const exitMessage = `<p class="align-middle text-center"> 
Please wait. You will be redirected back to Prolific in a few moments. 
<br /><br />
If not, please use the following completion code to ensure compensation for this study: C2TJMYKC.
</p>`

const exitExperiment = (): void => {
  document.body.innerHTML = exitMessage
  setTimeout(() => {
    window.location.replace(prolificCUrl)
  }, 3000)
}

const exitExperimentDebugging = (): void => {
  const contentDiv = document.getElementById('jspsych-content')
  if (contentDiv) contentDiv.innerHTML = exitMessage
}

export async function runExperiment(updateDebugPanel: () => void) {
  if (debug) {
    console.log('--runExperiment--')
    console.log('UserInfo ::', getUserInfo())
  }

  /* initialize jsPsych */
  const jsPsych = initJsPsych({
    show_progress_bar: true,
    on_data_update: function (trialData: TrialData) {
      if (debug) {
        console.log('jsPsych-update :: trialData ::', trialData)
      }
      // if trialData contains a saveIncrementally property, and the property is true, then save the trialData to Firestore immediately (otherwise the data will be saved at the end of the experiment)
      if (trialData.saveIncrementally) {
        saveTrialDataPartial(trialData as unknown as SaveableDataRecord).then(
          () => {
            if (debug) {
              console.log('saveTrialDataPartial: Success') // Success!
              if (mock) {
                updateDebugPanel()
              }
            }
          },
          (err: unknown) => {
            console.error(err) // Error!
          },
        )
      }
    },
    on_finish: (data: DataCollection) => {
      const contentDiv = document.getElementById('jspsych-content')
      if (contentDiv) contentDiv.innerHTML = '<p> Please wait, your data are being saved.</p>'
      saveTrialDataComplete(data.values()).then(
        () => {
          if (debug) {
            exitExperimentDebugging()
            console.log('saveTrialDataComplete: Success') // Success!
            console.log('jsPsych-finish :: data ::')
            console.log(data)
            setTimeout(() => {
              jsPsych.data.displayData()
            }, 3000)
          } else {
            exitExperiment()
          }
        },
        (err: unknown) => {
          console.error(err) // Error!
          exitExperiment()
        },
      )
    },
  })

  /* create timeline */
  const timeline: Record<string, unknown>[] = []

  /* preload images */
  
  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

  /* define trial variables for training trials */
    var most_trial0 = {
    type: jsPsychHtmlSliderResponse,
    stimulus: ,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Most items are whales</b>.</p>',
  }

  /* define trial variables for cooperative trials */
  var okay_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: ,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>If Susy throws her rock, the glass will shatter</b>.</p>',
  }

  
  const training = [most_trial0]
  const trials = [
    okay_trial2
  ]

  /* consent */
  const consent = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
    <div style="margin-left: 200px; margin-right: 200px; text-align: left;">
      <b><p style="margin-bottom: 20px;">Please consider this information carefully before deciding whether to participate in this research.</p></b>
      
      <p style="margin-bottom: 20px;">The purpose of this research is to examine which factors influence linguistic meaning. You will be asked to make judgements about the meaning of sentences in different scenarios. We are simply interested in your judgement. The study will take less than 1 hour to complete, and you will receive less than $20 on Prolific. Your compensation and time commitment are specified in the study description. There are no anticipated risks associated with participating in this study. The effects of participating should be comparable to those you would ordinarily experience from viewing a computer monitor and using a mouse or keyboard for a similar amount of time. At the end of the study, we will provide an explanation of the questions that motivate this line of research and will describe the potential implications.</p>
      
      <p style="margin-bottom: 20px;"margin-bottom: 50px;>Your participation in this study is completely voluntary and you may refuse to participate or you may choose to withdraw at any time without penalty or loss of benefits to you which are otherwise entitled. Your participation in this study will remain confidential. No personally identifiable information will be associated with your data. Also, all analyses of the data will be averaged across all the participants, so your individual responses will never be specifically analyzed.</p>
      
      <p style="margin-bottom: 20px;">If you have questions or concerns about your participation or payment, or want to request a summary of research findings, please contact Dr. Jonathan Phillips at <a href="mailto:Jonathan.S.Phillips@dartmouth.edu">Jonathan.S.Phillips@dartmouth.edu</a>.</p>
      
      <p style="margin-bottom: 20px;">Please save a copy of this form for your records.</p>
      
      <h3><b>Agreement:</b></h3>
      
      <p>The nature and purpose of this research have been sufficiently explained and I agree to participate in this study. I understand that I am free to withdraw at any time without incurring any penalty. Please consent by clicking the button below to continue. Otherwise, please exit the study at any time.</p>
    </div>
  `,
    choices: ['Submit'],
    //this specifies the way in which the data will be configured inside jspsych data variable...
    data: {
      internal_type: 'consent',
      trial_name: 'consent',
    },
  }
  timeline.push(consent)

  /* define fixation and test trials */
  const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: 'NO_KEYS',
    trial_duration: function () {
      return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0]
    },
    data: {
      task: 'fixation' satisfies Task,
    },
  }

  const question = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: jsPsych.timelineVariable('prompt'),
    choices: 'NO_KEYS',
    trial_duration: 2000,
    data: {
      task: 'question' satisfies Task,
    },
  }

  const test = {
    type: jsPsychImageKeyboardResponse,
    prompt: jsPsych.timelineVariable('prompt') as unknown as string,
    stimulus: jsPsych.timelineVariable('stimulus') as unknown as string,
    choices: ['ArrowLeft', 'ArrowRight'] satisfies KeyboardResponse[],
    data: {
      task: 'response' satisfies Task,
      // correct_response: jsPsych.timelineVariable('correct_response') as unknown as string,
    },
    on_finish: function (data: TrialData) {
      // data.correct = jsPsych.pluginAPI.compareKeys(data.response || null, data.correct_response || null)
      data.saveIncrementally = true
    },
  }


  /* define instructions for training trials*/
  var instructions0 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>You will be presented with two images. Select the image you think is likelier to fit the description.</p>
    <p>If the likelier image is on the left, press the left arrow <kbd>&larr;</kbd> on the keyboard as fast as you can. If the likelier image is on the right, press the right arrow <kbd>&rarr;</kbd> as fast as you can.</p>
    <p>Press any key to begin.</p>
  `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions0)
  
  /* define training procedure */
  const test_procedure0 = {
    timeline: [fixation, question, test],
    timeline_variables: training,
    repetitions: 1,
    randomize_order: true,
  }
  
  var more_training = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'You have completed the training trials. Press <b>R</b> for additional training trials, or <b>C</b> to continue.'
  }
  
  var loop_node = {
    timeline: [test_procedure0, more_training],
    loop_function: function(data){
        if(jsPsych.pluginAPI.compareKeys(data.values()[1].response, 'r')){
            return true;
        } else {
            return false;
        }
    }
  }
  timeline.push(loop_node) 

  /* define instructions for main trial */
  var instructions1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p>You will be presented with two images. Select the image you think is likelier to fit the description.</p>
    <p>If the likelier image is on the left, press the left arrow <kbd>&larr;</kbd> on the keyboard as fast as you can. If the likelier image is on the right, press the right arrow <kbd>&rarr;</kbd> as fast as you can.</p>
    <center>
    <p>Press any key to begin.</p>
  `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions1)

  /* define test procedure */
  const test_procedure = {
    timeline: [fixation, test],
    timeline_variables: trials,
    repetitions: 1,
    randomize_order: true,
  }
  timeline.push(test_procedure)

  /* start the experiment */
  // @ts-expect-error allow timeline to be type jsPsych TimelineArray
  await jsPsych.run(timeline)
}
