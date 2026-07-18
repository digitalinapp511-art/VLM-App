import StudyResource from '../../models/StudyResource.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

// GET /api/admin/study-library
export const getStudyLibrary = asyncHandler(async (req, res) => {
  const resources = await StudyResource.find();

  // We support Class 1 to Class 12
  const classesList = [];
  for (let i = 1; i <= 12; i++) {
    classesList.push(`Class ${i}`);
  }

  const data = classesList.map(clsName => {
    // Filter resources for this class
    const classResources = resources.filter(r => r.className === clsName);

    // Group resources by subject
    const subjectMap = {};
    classResources.forEach(r => {
      // Skip empty placeholder entries when checking active materials
      const isPlaceholder = r.title === r.subject && !r.pdfUrl && !r.videoUrl && !r.fileUrl;
      
      if (!subjectMap[r.subject]) {
        subjectMap[r.subject] = {
          id: `sub-${r.subject.toLowerCase().replace(/\s+/g, '-')}`,
          name: r.subject,
          notes: []
        };
      }

      if (!isPlaceholder) {
        subjectMap[r.subject].notes.push({
          id: r._id,
          _id: r._id,
          title: r.title,
          description: r.description || '',
          resourceType: r.type === 'note' ? 'notes' : r.type === 'video' ? 'videos' : r.type === 'pyq' ? 'previous_year_papers' : r.type,
          pdf: r.pdfUrl || r.fileUrl || '',
          pdfUrl: r.pdfUrl || r.fileUrl || '',
          videoUrl: r.videoUrl || '',
          thumbnailUrl: r.thumbnailUrl || '',
          fileUrl: r.fileUrl || '',
          board: r.board || 'CBSE',
          chapterName: r.chapterName || '',
          topic: r.topic || '',
          visibility: r.visibility || 'active',
          status: r.status || 'active'
        });
      }
    });

    return {
      className: clsName,
      subjects: Object.values(subjectMap)
    };
  });

  res.json({ success: true, data });
});

// POST /api/admin/study-library/subjects
export const addSubject = asyncHandler(async (req, res) => {
  const { className, subjectName } = req.body;

  if (!className || !subjectName) {
    return res.status(400).json({ success: false, message: 'Class name and subject name are required' });
  }

  // Create a placeholder resource so the subject exists in the system
  const placeholder = await StudyResource.create({
    title: subjectName,
    type: 'note',
    className,
    subject: subjectName,
    description: 'Subject Placeholder',
    visibility: 'active',
    status: 'active',
    uploadedBy: req.user?._id
  });

  res.status(201).json({
    success: true,
    data: {
      id: `sub-${subjectName.toLowerCase().replace(/\s+/g, '-')}`,
      name: subjectName,
      notes: []
    }
  });
});

// POST /api/admin/study-library/:className/subjects/:subjectId/notes
export const addNote = asyncHandler(async (req, res) => {
  const { className, subjectId } = req.params;
  const { title, content, description, link, fileUrl, pdfUrl, resourceType, board, visibility } = req.body;

  // Resolve subject name from subjectId slug (e.g. "sub-physics" -> "Physics")
  let subjectName = req.body.subject || req.body.subjectName;
  if (!subjectName && subjectId && subjectId.startsWith('sub-')) {
    const raw = subjectId.replace('sub-', '');
    subjectName = raw
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  if (!subjectName) subjectName = 'General';

  let type = 'note';
  if (resourceType === 'videos' || resourceType === 'video') type = 'video';
  else if (resourceType === 'previous_year_papers' || resourceType === 'pyq') type = 'pyq';

  // Save the custom category name to resourceType (e.g. 'mock-test')
  let dbResourceType = resourceType || 'note';
  if (dbResourceType === 'notes') dbResourceType = 'note';
  else if (dbResourceType === 'videos') dbResourceType = 'video';
  else if (dbResourceType === 'previous_year_papers') dbResourceType = 'pyq';

  const finalLink = link || pdfUrl || fileUrl || '';
  const finalDescription = content || description || 'No description provided.';

  // Create resource record
  const resource = await StudyResource.create({
    title,
    description: finalDescription,
    type,
    className,
    subject: subjectName,
    board: board || 'CBSE',
    visibility: visibility || 'active',
    status: visibility || 'active',
    pdfUrl: type !== 'video' ? finalLink : '',
    videoUrl: type === 'video' ? finalLink : '',
    fileUrl: finalLink,
    resourceType: dbResourceType,
    uploadedBy: req.user?._id
  });

  res.status(201).json({
    success: true,
    data: {
      id: resource._id,
      _id: resource._id,
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType || 'note',
      pdf: resource.fileUrl,
      pdfUrl: resource.fileUrl,
      board: resource.board,
      visibility: resource.visibility
    }
  });
});

// POST /api/admin/upload/pdf
export const uploadPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Return url property inside data object as expected by StudyMaterial.jsx line 215
  res.json({
    success: true,
    url: req.file.path,
    data: {
      url: req.file.path
    }
  });
});

// DELETE /api/admin/study-library/:className/subjects/:subjectId
export const deleteSubject = asyncHandler(async (req, res) => {
  const { className, subjectId } = req.params;

  let subjectName = '';
  if (subjectId && subjectId.startsWith('sub-')) {
    const raw = subjectId.replace('sub-', '');
    subjectName = raw
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  if (!subjectName) {
    return res.status(400).json({ success: false, message: 'Invalid subject ID' });
  }

  // Delete all study resources (files and placeholders) for this subject in the class
  await StudyResource.deleteMany({
    className,
    subject: { $regex: new RegExp(`^${subjectName}$`, 'i') }
  });

  res.json({ success: true, message: `Subject '${subjectName}' and its files deleted successfully` });
});
