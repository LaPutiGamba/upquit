import { db } from "./database/connection.js";
import InMemoryAsyncEventBus from "./events/InMemoryAsyncEventBus.js";
import WebSocketRealtimePublisher from "./services/WebSocketRealtimePublisher.js";

// ========================
// Repositories
// ========================
import VoteDrizzleRepository from "../../modules/votes/infrastructure/repositories/VoteDrizzleRepository.js";
import RequestDrizzleRepository from "../../modules/requests/infrastructure/repositories/RequestDrizzleRepository.js";
import GiveToGetProgressDrizzleRepository from "../../modules/give-to-get/infrastructure/repositories/GiveToGetProgressDrizzleRepository.js";
import BoardDrizzleRepository from "../../modules/boards/infrastructure/repositories/BoardDrizzleRepository.js";

// ========================
// Domain Events
// ========================
import VoteCreatedEvent from "../../modules/votes/domain/events/VoteCreatedEvent.js";
import VoteDeletedEvent from "../../modules/votes/domain/events/VoteDeletedEvent.js";

// ========================
// Event Listeners
// ========================
import IncrementVoteCountOnVoteCreated from "../../modules/requests/application/listeners/IncrementVoteCountOnVoteCreated.js";
import UpdateProgressOnVoteCreated from "../../modules/give-to-get/application/listeners/UpdateProgressOnVoteCreated.js";
import DecrementVoteCountOnVoteDeleted from "../../modules/requests/application/listeners/DecrementVoteCountOnVoteDeleted.js";
import RevertProgressOnVoteDeleted from "../../modules/give-to-get/application/listeners/RevertProgressOnVoteDeleted.js";

// ========================
// Command Handlers
// ========================
import CreateVoteCommandHandler from "../../modules/votes/application/handlers/CreateVoteCommandHandler.js";
import DeleteVoteCommandHandler from "../../modules/votes/application/handlers/DeleteVoteCommandHandler.js";

// ========================
// Event Bus and Realtime Publisher
// ========================
export const eventBus = new InMemoryAsyncEventBus();
export const realtimePublisher = new WebSocketRealtimePublisher();

// ========================
// Repositories Instances
// ========================
export const voteRepository = new VoteDrizzleRepository(db);
export const requestRepository = new RequestDrizzleRepository(db);
export const giveToGetProgressRepository = new GiveToGetProgressDrizzleRepository(db);
export const boardRepository = new BoardDrizzleRepository(db);

// ========================
// Event Listeners Instances
// ========================
export const incrementVoteCountListener = new IncrementVoteCountOnVoteCreated(requestRepository, realtimePublisher);
export const updateProgressListener = new UpdateProgressOnVoteCreated(giveToGetProgressRepository, boardRepository, realtimePublisher);
export const decrementVoteCountListener = new DecrementVoteCountOnVoteDeleted(requestRepository, realtimePublisher);
export const revertProgressListener = new RevertProgressOnVoteDeleted(giveToGetProgressRepository, boardRepository, realtimePublisher);

// ========================
// Subscribe Listeners to Events
// ========================
eventBus.subscribe("vote.created", (event: VoteCreatedEvent) => incrementVoteCountListener.handle(event));
eventBus.subscribe("vote.created", (event: VoteCreatedEvent) => updateProgressListener.handle(event));
eventBus.subscribe("vote.deleted", (event: VoteDeletedEvent) => decrementVoteCountListener.handle(event));
eventBus.subscribe("vote.deleted", (event: VoteDeletedEvent) => revertProgressListener.handle(event));

// ========================
// Command Handlers Instances
// ========================
export const createVoteCommandHandler = new CreateVoteCommandHandler(voteRepository, eventBus);
export const deleteVoteCommandHandler = new DeleteVoteCommandHandler(voteRepository, eventBus);
