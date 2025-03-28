import { Observable } from "rxjs";
import { DetailClientResponse, ListClientResponse, SaveClientRequest, UpdateClientRequest } from "./client.models";

export interface ICLientService {

    save(request: SaveClientRequest): Observable<SaveClientRequest>

    update(id: number, request: UpdateClientRequest): Observable<UpdateClientRequest>

    delete(id: number): Observable<void>
    
    list(): Observable<ListClientResponse[]>

    findById(id: number): Observable<DetailClientResponse>
}