import { db } from "./database/connection.js";
import { getWebSocketServer } from "./websocket/WebSocketServerRegistry.js";
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

// ========================
// Event Listeners
// ========================
import IncrementVoteCountOnVoteCreated from "../../modules/requests/application/listeners/IncrementVoteCountOnVoteCreated.js";
import UpdateProgressOnVoteCreated from "../../modules/give-to-get/application/listeners/UpdateProgressOnVoteCreated.js";

// ========================
// Command Handlers
// ========================
import CreateVoteCommandHandler from "../../modules/votes/application/handlers/CreateVoteCommandHandler.js";

// ========================
// Event Bus and Realtime Publisher
// ========================
export const eventBus = new InMemoryAsyncEventBus();
export const realtimePublisher = new WebSocketRealtimePublisher(getWebSocketServer());

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
export const updateProgressListener = new UpdateProgressOnVoteCreated(giveToGetProgressRepository, boardRepository);

// ========================
// Subscribe Listeners to Events
// ========================
eventBus.subscribe("vote.created", (event: VoteCreatedEvent) => incrementVoteCountListener.handle(event));
eventBus.subscribe("vote.created", (event: VoteCreatedEvent) => updateProgressListener.handle(event));

// ========================
// Command Handlers Instances
// ========================
export const createVoteCommandHandler = new CreateVoteCommandHandler(voteRepository, eventBus);
