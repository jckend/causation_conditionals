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
  
  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

  var trial_1 = {
      type: jsPsychHtmlSliderResponse,
      stimulus: '<div style="margin: 50px auto; width: 100px; height: 100px; background-color: rgb(46, 26, 122);"></div>',
      labels: ['Purple', 'Blue'],
      slider_width: 500,
      require_movement: true,
      prompt: '<p>Is this color closer to purple or blue? Use the slider above.</p>'
    };
  timeline.push(trial1)

    var trial_2 = {
      type: jsPsychHtmlSliderResponse,
      stimulus: '<div style="margin: 50px auto; width: 100px; height: 100px; background-color: rgb(29, 23, 138)"></div>',
      labels: ['Purple', 'Blue'],
      slider_start: 10,
      slider_width: 500,
      prompt: '<p>Is this color closer to purple or blue? Use the slider above. (5s time limit; custom starting value).</p>',
      trial_duration: 5000
    };
  timeline.push(trial2)

    var trial_3 = {
      type: jsPsychHtmlSliderResponse,
      stimulus: '<div style="margin: 50px auto; width: 100px; height: 100px; background-color: rgb(63, 17, 129)"></div>',
      labels: ['Purple', 'Blue'],
      prompt: '<p>Is this color closer to purple or blue? Use the slider above. (1s display).</p>',
      slider_width: 500,
      stimulus_duration: 1000
    };
  timeline.push(trial3)

  /* start the experiment */
  // @ts-expect-error allow timeline to be type jsPsych TimelineArray
  await jsPsych.run(timeline)
}
