"use client";
import { FormEvent, useState } from "react";
import { QAns, UIState } from "@/common/interfaces/TestUi.interface";
import { api } from "@/trpc/react";
import { SystemPrompt } from "../constants/prompts";
const inputs = [
  {
    label: "Enter your name",
    name: "nameOfCandidate",
  },
  {
    label: "Enter company name for which you are applying",
    name: "companyApplyingFor",
  },
  {
    label: "Enter position for which you are applying",
    name: "positionApplyingFor",
  },
  {
    label: "Enter seniority level (fresher, experienced)",
    name: "experienceType",
  },
  {
    label: "Enter interview type : technical, behavioral, case-based",
    name: "interviewType",
  },
];

const initialState = {
  prompt:SystemPrompt,
  nameOfCandidate: "James",
  companyApplyingFor: "Google",
  positionApplyingFor: "Software Developer",
  interviewType: "technical",
  experienceType: "fresher",
  needAudio: "N",
};


export default function TestUI() {
  const [state, setState] = useState<UIState>(initialState);
  const [pairs, setPairs] = useState<QAns[]>([])
  const { status, data, error, refetch, isLoading } = api.test.checkResponse.useQuery({...state, pairs},{enabled:false});
  if(data){
    setPairs((pairs)=>[...pairs, {question:data,answer:""}])
  }
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await refetch();
  }

  function handleChange(name: string,value:string){
    setState((state)=>({...state,[name]:value}))
  }

  function addPair(){
    setPairs((pairs)=>[...pairs, {question:"",answer:""}])
  }

  function removePair(id:number){
    setPairs((pairs)=>pairs.filter((_,index)=>index!=id))
  }

  function handlePairChange(id:number,key:keyof QAns,val:string){
    let local = [...pairs]
    if(local[id]){
      local[id][key] = val
    }
    setPairs(local)
  }
  return (
    <div>
      <h1 className="text-2xl">Test AI Response</h1>
      <form className="grid grid-cols-2 gap-2" onSubmit={handleSubmit}>
        <label>System prompt</label>
        <textarea className="rounded-md border-2 p-2 col-span-2 text-blue-800" value={state.prompt} onChange={(e)=>handleChange("prompt",e.target.value)}/>

        {inputs.map(({ label, name }) => (
          <>
            <label className="font-semibold text-gray-600">{label}</label>
            <input onChange={(e)=>handleChange(name,e.target.value)} className="rounded-md border-2 p-2 text-blue-800" name={name} value={state[name as keyof UIState] as string} type="text" required />
          </>
        ))}

<label className="font-semibold text-gray-600 col-span-2">Assistant : User (Question : Answer) pair  <button className="btn w-fit bg-green-500 text-white p-1.5" type="button" onClick={addPair}>Add pair</button> </label>
        {pairs.map(({question,answer},index)=>(
          <>
          <p className="col-span-2">Question {index+1}  <button className="btn w-fit bg-red-500 text-white p-1.5" type="button" onClick={()=>removePair(index)}>Remove</button></p>
          <textarea placeholder="Question here..." className="rounded-md border-2 p-2 text-blue-800"  value={question} onChange={(e)=>handlePairChange(index,'question',e.target.value)}/>
          <textarea placeholder="Answer here..."className="rounded-md border-2 p-2 text-blue-800"  value={answer} onChange={(e)=>handlePairChange(index,'answer',e.target.value)}/>
          </>
        ))}
        {/* <fieldset className="flex gap-3">
          <legend>Need OpenAI audio</legend>
          <>
            <input type="radio" id="option-yes" name="fruit" value="Y" checked={state["needAudio"] == "Y"} />
            <label htmlFor="apple">Yes</label>
          </>

          <>
            <input type="radio" id="option-no" name="fruit" value="N" checked={state["needAudio"] == "N"} />
            <label htmlFor="banana">No</label>
          </>
        </fieldset> */}

        <button className="btn w-fit bg-blue-200 p-3" type="submit">Submit</button>

      </form>
        {isLoading && <h1 className="text-2xl">Loading....</h1>}
        {error && <p className="text-red-500">{error.message}</p>}
        {data && <p className="text-green-600">{data}</p>}
    </div>
  );
}
