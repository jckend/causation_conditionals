// import jsPsychSurveyMultiChoice from '@jspsych/plugin-survey-multi-choice'
import externalHtml from '@jspsych/plugin-external-html'
import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response'
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'


import { debugging, getUserInfo, mockStore, prolificCC, prolificCUrl } from './globalVariables'
import { saveTrialDataComplete, saveTrialDataPartial } from './lib/databaseUtils'

// import type { jsPsychSurveyMultiChoice, Task, TrialData } from './project'
import type { SaveableDataRecord } from '../types/project'
import type { DataCollection } from 'jspsych'

import imgBeaver1 from 'C:/Users/caleb/all_ginger_some_beaver1.png'
import imgBeaver2 from 'C:/Users/caleb/all_ginger_some_beaver2.png'
import imgWhale1 from 'C:/Users/caleb/all_whale_some_carrot1.png'
import imgWhale2 from 'C:/Users/caleb/all_whale_some_carrot2.png'
import imgCoffee from 'C:/Users/caleb/spoon_coffee.png'
import imgVolcano1 from 'C:/Users/caleb/volcano1.png'
import imgVolcano2 from 'C:/Users/caleb/volcano2.png'
import imgBurg1 from './images/all_some_burger1.png'
import imgBurg2 from './images/all_some_burger2.png'
import imgSax1 from './images/all_some_clamp1.png'
import imgSax2 from './images/all_some_clamp2.png'
import imgSnail1 from './images/all_some_snail1.png'
import imgSnail2 from './images/all_some_snail2.png'
import imgSpoon1 from './images/all_some_spoon1.png'
import imgSpoon2 from './images/all_some_spoon2.png'
import imgGorilla1 from 'C:/Users/caleb/all_some_gorilla1.png'
import imgGorilla2 from 'C:/Users/caleb/all_some_gorilla2.png'
import imgCouples1 from './images/couples_adhoc1.png'
import imgCouples2 from './images/couples_adhoc2.png'
import imgAvocado1 from 'C:/Users/caleb/avocoda_adhoc1.png'
import imgAvocado2 from 'C:/Users/caleb/avocoda_adhoc2.png'
import imgPetri1 from 'C:/Users/caleb/petri_adhoc1.png'
import imgPetri2 from 'C:/Users/caleb/petri_adhoc2.png'
import imgTube1 from 'C:/Users/caleb/tube_adhoc1.png'
import imgTube2 from 'C:/Users/caleb/tube_adhoc2.png'
import imgDark1 from './images/dark_black1.png'
import imgDark2 from './images/dark_black2.png'
import imgPartic1 from 'C:/Users/caleb/gold_bronze1.png'
import imgPartic2 from 'C:/Users/caleb/gold_bronze2.png'
import imgWarm1 from './images/warmhot_1.png'
import imgWarm2 from './images/warmhot_2.png'
import imgPrice1 from 'C:/Users/caleb/free_two1.png'
import imgPrice2 from 'C:/Users/caleb/free_two2.png'
import imgTime1 from 'C:/Users/caleb/low_depleted1.png'
import imgTime2 from 'C:/Users/caleb/low_depleted2.png'


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
  const preload = {
    type: jsPsychPreload,
    images: [
      imgBeaver1,
      imgBeaver2,
      imgBurg1,
      imgBurg2,
      imgDark1,
      imgDark2,
      imgWarm1,
      imgWarm2,
      imgSnail1,
      imgSnail2,
      imgSpoon1,
      imgSpoon2,
      imgSax1,
      imgSax2,
      imgCouples1,
      imgCouples2,
      imgPartic1,
      imgPartic2,
    ],
  }
  timeline.push(preload)
  
  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

  /* define trial variables for training trials */
  var all_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBeaver1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<center><b>All items are ginger roots</b>.</center>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

    var most_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWhale1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Most items are whales</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var few_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBeaver2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Few items are beavers</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var heat_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgVolcano1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The item is warm</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var some_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWhale2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Some items are carrots</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var adhoc_trial0 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgCoffee,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>There is a coffee on the right</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }


  /* define trial variables for cooperative trials */
  var few_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Few items are spoons</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var few_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Few items are clamps</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var few_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Few items are clamps</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var few_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgGorilla2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Few items are snakes</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var heat_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The item on the card is warm</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var some_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgGorilla1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Some items are gorillas</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var some_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Some items are saxophones</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var some_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Some items are burgers</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var some_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Some items are spoons</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var some_trial5 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Some items are saxophones</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var some_trial6 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgGorilla2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Some items are gorillas</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var adhoc_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgCouples2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>A man is wearing a teal shirt</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var adhoc_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgCouples1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>A man is wearing a teal shirt</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var adhoc_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgAvocado1,
    stimulus_height: 700,
    stimulus_width: 700, 
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>There is an avocado at the top</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

    var adhoc_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgAvocado2,
    stimulus_height: 700,
    stimulus_width: 700, 
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>There is an avocado at the top</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

    var adhoc_trial5 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgTube1,
    stimulus_height: 700,
    stimulus_width: 700, 
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>There is a tube on the bottom</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

    var adhoc_trial6 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgTube2,
    stimulus_height: 700,
    stimulus_width: 700, 
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>There is a tube on the bottom</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

    var adhoc_trial7 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPetri1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>There is a petri dish on the right</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

    var adhoc_trial8 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPetri2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>There is a petri dish on the right</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }
  
  var most_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Most items are burgers</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var all_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgBurg1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>All the items are burgers</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var all_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSnail1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>All the items are spoons</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }


  var most_trial3 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgGorilla1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Most items are gorillas</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var most_trial4 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgSax1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>Most items are saxophones</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var hair_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgDark2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The man has dark hair</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var partic_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPartic2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The medal was won by a participant</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var partic_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPartic1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The medal was won by a participant</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var warm_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The item is warm</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var warm_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgWarm2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The item is warm</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var price_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPrice1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The item is cheap</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var price_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPrice2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The item is cheap</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }


  var time_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgTime1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The time is running low</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var time_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgTime2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The time is running low</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var okay_trial1 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPartic1,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The person who won the medal did okay</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  var okay_trial2 = {
    type: jsPsychImageKeyboardResponse,
    stimulus: imgPartic2,
    stimulus_width: 700,
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: '<p><b>The person who won the medal did okay</b>.</p>',
    trial_duration: 4000,
    response_ends_trial: true,
  }

  
  const training = [all_trial0, most_trial0, few_trial0, some_trial0, adhoc_trial0, heat_trial0]
  const trials = [
    few_trial1,
    few_trial2,
    few_trial3,
    few_trial4,
    some_trial1,
    some_trial2,
    some_trial3,
    some_trial4,
    some_trial5,
    some_trial6,
    most_trial1,
    adhoc_trial1,
    adhoc_trial2,
    adhoc_trial3,
    adhoc_trial4,
    adhoc_trial5,
    adhoc_trial6,
    adhoc_trial7,
    adhoc_trial8,
    hair_trial1,
    partic_trial1,
    partic_trial2,
    warm_trial1,
    warm_trial2,
    all_trial1,
    all_trial2,
    price_trial1,
    price_trial2,
    time_trial1, 
    time_trial2,
    okay_trial1,
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
    trial_duration: 4000,
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
    <center>
    <div style='width: 700px;'><img src='${imgBurg2}'></img>
    </div>
    </center>
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
    <div style='width: 700px;'><img src='${imgSnail1}'></img>
    </div>
    </center>
    <p>Press any key to begin.</p>
  `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions1)

  /* define test procedure */
  const test_procedure = {
    timeline: [fixation, question, test],
    timeline_variables: trials,
    repetitions: 1,
    randomize_order: true,
  }
  timeline.push(test_procedure)

  /* start the experiment */
  // @ts-expect-error allow timeline to be type jsPsych TimelineArray
  await jsPsych.run(timeline)
}
