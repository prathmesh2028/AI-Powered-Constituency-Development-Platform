import * as suggestionService from "../services/suggestion.service.js";
import catchAsync from "../utils/catchAsync.js";

/**
 * Controller: Handles POST /api/suggestions
 * Assumes req.body has already passed through Zod validation middleware.
 */
export const createSuggestion = catchAsync(async (req, res) => {
  const suggestion = await suggestionService.createSuggestion(req.body);
  res.status(201).json({ success: true, data: suggestion });
});

export const getSuggestions = catchAsync(async (req, res) => {
  const paginatedResult = await suggestionService.getSuggestions(req.query);
  res.status(200).json({ success: true, ...paginatedResult });
});

export const getSuggestionById = catchAsync(async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ success: false, message: "Suggestion ID is required" });
  }
  const suggestion = await suggestionService.getSuggestionById(req.params.id);
  if (!suggestion) {
    return res.status(404).json({ success: false, message: "Suggestion not found" });
  }
  res.status(200).json({ success: true, data: suggestion });
});

export const updateSuggestionStatus = catchAsync(async (req, res) => {
  const updatedSuggestion = await suggestionService.updateSuggestionStatus(req.params.id, req.body.status);
  if (!updatedSuggestion) {
    return res.status(404).json({ success: false, message: "Suggestion not found" });
  }
  res.status(200).json({ success: true, data: updatedSuggestion });
});

export const seedSuggestions = catchAsync(async (req, res) => {
  const Suggestion = (await import("../models/suggestion.model.js")).default;
  const DEMO_CITIZEN_ID = "6582f3a4b12c3d4e5f6a7b8c";
  
  const seedData = [
    // Baramati Constituency
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Baramati Constituency",
      village: "Supe",
      title: "Main Highway Pothole Repairs",
      description: "Heavy pothole craters along the main Supe state highway are causing traffic blocks and minor motor accidents daily.",
      category: "infrastructure",
      status: "under_review",
      priorityScore: 8,
      phoneNumber: "9876543210"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Baramati Constituency",
      village: "Nira",
      title: "Clean Water Pipeline Contamination",
      description: "Drinking water supplied to Nira sector 3 is running brown with soil residue. Requesting pipeline flushing.",
      category: "infrastructure",
      status: "submitted",
      priorityScore: 9,
      phoneNumber: "9876543211"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Baramati Constituency",
      village: "Malegaon",
      title: "Market Street Light Installation",
      description: "Malegaon main market area gets completely dark after 7 PM, leading to minor safety concerns for evening shoppers.",
      category: "infrastructure",
      status: "submitted",
      priorityScore: 6,
      phoneNumber: "9876543212"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Baramati Constituency",
      village: "Someshwar",
      title: "Sugar Factory Canal Silting",
      description: "The irrigation canal near Someshwar sugar factory is heavily silted with crop residues and waste, blocking water flow to agricultural fields. Farmers are experiencing crop water shortage.",
      category: "infrastructure",
      status: "submitted",
      priorityScore: 8,
      phoneNumber: "9876543213"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Baramati Constituency",
      village: "Jejuri",
      title: "Pilgrim Safety & Footpath Upgrades",
      description: "With over 50,000 pilgrims visiting Jejuri temple weekly, the pedestrian footpaths are narrow and cracked. Requesting safety railings, road widening, and dedicated pilgrim lanes.",
      category: "policy",
      status: "implemented",
      priorityScore: 7,
      phoneNumber: "9876543214"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Baramati Constituency",
      village: "Walchandnagar",
      title: "Primary Health Center Backup Power",
      description: "The local hospital faces frequent load shedding power cuts, disrupting emergency operations. A clean solar-powered generator backup is immediately needed.",
      category: "community",
      status: "submitted",
      priorityScore: 8,
      phoneNumber: "9876543215"
    },

    // Mumbai North Constituency
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Mumbai North Constituency",
      village: "Borivali",
      title: "Station Road Pedestrian Congestion",
      description: "Station road is completely blocked by unauthorized hawkers. Pedestrians are forced to walk on the main road, causing heavy transit danger.",
      category: "policy",
      status: "submitted",
      priorityScore: 7,
      phoneNumber: "9876543220"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Mumbai North Constituency",
      village: "Dahisar",
      title: "Dahisar River Desiltation Request",
      description: "Dahisar river is clogged with heavy plastic waste and industrial sludge. This will cause major low-lying flooding during monsoon season.",
      category: "infrastructure",
      status: "under_review",
      priorityScore: 9,
      phoneNumber: "9876543221"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Mumbai North Constituency",
      village: "Malad West",
      title: "Public Sports Park Renovation",
      description: "The children's play equipment in Choksi park Malad is completely rusted and broken. Requesting immediate replacement.",
      category: "community",
      status: "implemented",
      priorityScore: 5,
      phoneNumber: "9876543222"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Mumbai North Constituency",
      village: "Kandivali East",
      title: "Akurliroad Traffic Detour Plan",
      description: "Heavy school bus transit and commercial vehicles during peak morning hours jam the narrow Akurli road flyover underpass. Need a traffic detour policy.",
      category: "policy",
      status: "submitted",
      priorityScore: 8,
      phoneNumber: "9876543223"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Mumbai North Constituency",
      village: "Charkop",
      title: "Charkop Sector 8 Drainage Siltation",
      description: "Sewer pipes in Sector 8 are fully clogged with plastic waste. During heavy Mumbai showers, sewage backs up into resident ground floor apartments.",
      category: "infrastructure",
      status: "submitted",
      priorityScore: 9,
      phoneNumber: "9876543224"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Mumbai North Constituency",
      village: "Magathane",
      title: "Community Sanitation Block Repair",
      description: "The community sanitation block in Magathane has broken water pipes and non-functional septic pits. Requesting urgent repair to avoid health outbreaks.",
      category: "community",
      status: "submitted",
      priorityScore: 8,
      phoneNumber: "9876543225"
    },

    // Bangalore South Constituency
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Bangalore South Constituency",
      village: "Jayanagar",
      title: "Jayanagar 4th Block Garbage Clearing",
      description: "Garbage dumpsters outside the local complex are overflowing and haven't been cleared for three days. Bad smell and stray dogs are compiling.",
      category: "community",
      status: "submitted",
      priorityScore: 8,
      phoneNumber: "9876543230"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Bangalore South Constituency",
      village: "BTM Layout",
      title: "Water Logging near Silk Board Flyover",
      description: "Minor rain showers block storm water drains, leading to knee-deep water logging at the entrance of BTM layout.",
      category: "infrastructure",
      status: "under_review",
      priorityScore: 9,
      phoneNumber: "9876543231"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Bangalore South Constituency",
      village: "Basavanagudi",
      title: "Basavanagudi School Library Audit",
      description: "Local state-run primary school has no updated library books or educational resources. Requesting budget grants.",
      category: "policy",
      status: "submitted",
      priorityScore: 6,
      phoneNumber: "9876543232"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Bangalore South Constituency",
      village: "Padmanabhanagar",
      title: "Senior Park Lights and CCTV",
      description: "The main public park has broken lighting poles, making it unsafe for senior citizens during early morning and evening walks. Need solar streetlights and CCTVs.",
      category: "community",
      status: "implemented",
      priorityScore: 7,
      phoneNumber: "9876543233"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Bangalore South Constituency",
      village: "Chickpet",
      title: "Commercial Street Fire Safety Audit",
      description: "Due to extremely narrow lanes and dangling overhead electricity wires, fire trucks cannot access shops in Chickpet in case of emergency. Requesting ducting.",
      category: "policy",
      status: "submitted",
      priorityScore: 9,
      phoneNumber: "9876543234"
    },
    {
      citizenId: DEMO_CITIZEN_ID,
      constituency: "Bangalore South Constituency",
      village: "Vijayanagar",
      title: "Vijayanagar Metro Pedestrian Skywalk",
      description: "High speed traffic on the outer ring road makes crossing from the metro station to the bus stand highly dangerous. An overhead skywalk is required.",
      category: "infrastructure",
      status: "submitted",
      priorityScore: 8,
      phoneNumber: "9876543235"
    }
  ];

  let inserted = 0;
  for (const item of seedData) {
    const exists = await Suggestion.findOne({ constituency: item.constituency, title: item.title });
    if (!exists) {
      await new Suggestion(item).save();
      inserted++;
    }
  }

  const counts = await Suggestion.aggregate([
    { $group: { _id: "$constituency", count: { $sum: 1 } } }
  ]);

  res.status(200).json({ success: true, message: `Successfully seeded suggestions. Inserted ${inserted} items.`, counts });
});

