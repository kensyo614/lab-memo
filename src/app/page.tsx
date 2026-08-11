import {Auth} from "@/lib/auth"
export default async function Page() {
  const user = await Auth()
  return <h1>LabMemo</h1>
}
