import { useQuery } from "convex/react";
import { FileBrowser } from "../_components/file-browser";
import { api } from "../../../../convex/_generated/api";


export default function TrashPage(){
    return (<div>
<FileBrowser title="Rác" deletedOnly/>
    </div>)
}