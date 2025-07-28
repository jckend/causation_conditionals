/* eslint-disable @typescript-eslint/naming-convention */

import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychImageSliderResponse from '@jspsych/plugin-image-slider-response'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'

import { debugging, getUserInfo, mockStore, prolificCC, prolificCUrl } from './globalVariables'
import { saveTrialDataComplete, saveTrialDataPartial } from './lib/databaseUtils'

import type { SaveableDataRecord } from '../types/project'
import type { DataCollection } from 'jspsych'

import imgThrow1 from 'hosting/src/images/rock__throw_guy1.png'
import imgThrow2 from 'hosting/src/images/ChatGPT Image Jul 28, 2025, 11_09_14 AM.png'
import imgThrow3 from 'hosting/src/images/rock__throw_guy3.png'

/* Alternatively
 * type JsPsychInstance = ReturnType<typeof initJsPsych>
 * type JsPsychGetData = JsPsychInstance['data']['get']
 * export type JsPsychDataCollection = ReturnType<JsPsychGetData>
 */

const debug = debugging()
const mock = mockStore()

type Task = 'response' | 'fixation'
type Response = 'left' | 'right'
type KeyboardResponse = 'f' | 'j'

interface TrialData {
  task: Task
  response: Response
  correct: boolean
  correct_response: Response
  saveIncrementally: boolean
}

const debuggingText = debug ? `<br /><br />redirect link : ${prolificCUrl}` : '<br />'
const exitMessage = `<p class="text-center align-middle">
Please wait. You will be redirected back to Prolific in a few moments.
<br /><br />
If not, please use the following completion code to ensure compensation for this study: ${prolificCC}
${debuggingText}
</p>`

const exitExperiment = (): void => {
  document.body.innerHTML = exitMessage
  setTimeout(() => {
    globalThis.location.replace(prolificCUrl)
  }, 3000)
}

const exitExperimentDebugging = (): void => {
  const contentDiv = document.querySelector('#jspsych-content')
  if (contentDiv) contentDiv.innerHTML = exitMessage
}

export async function runExperiment(updateDebugPanel: () => void): Promise<void> {
  if (debug) {
    console.log('--runExperiment--')
    console.log('UserInfo ::', getUserInfo())
  }

  /* initialize jsPsych */
  const jsPsych = initJsPsych({
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
          (error: unknown) => {
            console.error(error) // Error!
          },
        )
      }
    },
    on_finish: (data: DataCollection) => {
      const contentDiv = document.querySelector('#jspsych-content')
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
        (error: unknown) => {
          console.error(error) // Error!
          exitExperiment()
        },
      )
    },
  })

  /* create timeline */
  const timeline: Record<string, unknown>[] = []

  /* preload images */
  const preload = {
    type: jsPsychPreload,
    images: [imgThrow1, imgThrow2, imgThrow3],
  }
  timeline.push(preload)

  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

  /* define instructions trial */
  const instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
<p>In this experiment, a circle will appear in the center of the screen.</p>
<p>If the circle is <span class="font-semibold text-blue-500">blue</span>, press the letter <span class="font-semibold text-blue-500">F</span> on the keyboard as fast as you can.</p>
<p>If the circle is <span class="font-semibold text-orange-500">orange</span>, press the letter <span class="font-semibold text-orange-500">J</span> as fast as you can.</p>
<p>Press any key to begin.</p>
    `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions)

  /* define trial stimuli array for timeline variables */
  const test_stimuli: Record<string, string>[] = [
    { stimulus: imgThrow1, prompt: '<p>If the man throws his rock, the <span class="font-semibold text-blue-500">vase will shatter</span>.</p>'},
    { stimulus: imgThrow1, prompt: '<p>If the man does not throw his rock, the <span class="font-semibold text-orange-500">vase will not shatter</span>.</p>'},
    { stimulus: imgThrow2, prompt: '<p>If the man throws his rock, the <span class="font-semibold text-blue-500">vase will shatter</span>.</p>'},
    { stimulus: imgThrow2, prompt: '<p>If the man does not throw his rock, the <span class="font-semibold text-orange-500">vase will not shatter</span>.</p>'},
    { stimulus: imgThrow3, prompt: '<p>If the man does not throw his rock, the <span class="font-semibold text-orange-500">vase will not shatter</span>.</p>'},
    { stimulus: imgThrow3, prompt: '<p>If the man does not throw his rock, the <span class="font-semibold text-orange-500">vase will not shatter</span>.</p>'},
  ]

  
  /*define likert scale*/
  var likert_scale = [ "False", "Unsure", "True" ]

  /* define test trials */
  const test1 = {
    type: jsPsychImageSliderResponse,
    stimulus: jsPsych.timelineVariable('stimulus') as unknown as string,
    labels: ['0%', '50%','100%'],
    prompt: jsPsych.timelineVariable('prompt') as unknown as string,
    slider_width: 500,
    on_finish: function (data: TrialData) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, unicorn/no-null
      data.saveIncrementally = true
    },
  }


  /* define test procedure */
  const test_procedure = {
    timeline: [test1],
    timeline_variables: test_stimuli,
    repetitions: 1,
    randomize_order: true,
  }
  timeline.push(test_procedure)
  
  /* define debrief */
  const debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
      return `
          <p>Press any key to complete the experiment. Thank you!</p>`
    },
  }
  timeline.push(debrief_block)

  /* start the experiment */
  // @ts-expect-error allow timeline to be type jsPsych TimelineArray
  await jsPsych.run(timeline)
}
