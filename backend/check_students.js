import mongoose from 'mongoose';

const uri = 'mongodb+srv://academyvlm_db_user:PWuEjv2qqJ1oGEtf@cluster0.jay0pca.mongodb.net/test?appName=Cluster0';

async function check() {
  await mongoose.connect(uri);
  console.log('Connected to DB');
  
  const Student = mongoose.connection.collection('students');
  const allStudents = await Student.find({}).toArray();
  console.log(`Total students: ${allStudents.length}`);
  
  const statuses = {};
  allStudents.forEach(s => {
    const status = s.subscription?.status || 'none';
    statuses[status] = (statuses[status] || 0) + 1;
    if (status !== 'none' || s.subscription) {
      console.log(`Student: ${s.firstName} ${s.lastName || ''}, status: ${status}, planId: ${s.subscription?.planId}, trialEndsAt: ${s.subscription?.trialEndsAt}`);
    }
  });
  console.log('Statuses count:', statuses);
  
  const plans = await mongoose.connection.collection('plans').find({}).toArray();
  console.log(`Total plans: ${plans.length}`);
  plans.forEach(p => {
    console.log(`Plan: ${p.name}, ID: ${p._id}, Price: ${p.price}, class: ${p.class}`);
  });

  // Let's migrate Krishna Joshi to have status 'trial' for testing!
  const planToLink = plans[1] || plans[0];
  if (planToLink) {
    const result = await Student.updateOne(
      { firstName: /^Krishna/i },
      {
        $set: {
          'subscription.status': 'trial',
          'subscription.planId': planToLink._id,
          'subscription.trialEndsAt': new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      }
    );
    console.log('Migrated Krishna Joshi to trial:', result);
  }

  await mongoose.connection.close();
}

check().catch(console.error);
