import {useParams} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";

import {getSession} from "../api/sessionApi";

function SessionPage() {
    const {shareCode} = useParams();
    const sessionQuery = useQuery({
        queryKey: ['session', shareCode],
        queryFn: () => getSession(shareCode!),
    });
    if (sessionQuery.isPending) {
        return <div>Loading...</div>;
    }
    if (sessionQuery.isError) {
        return <div>Error loading session</div>;
    }
    return (
        <div>
            <h1>Session Page</h1>
            <pre>
                {JSON.stringify(sessionQuery.data, null, 2)}
            </pre>
        </div>
    );
}

export default SessionPage;