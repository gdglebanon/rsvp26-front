const split = value => typeof value === 'string' ? value.split(',').map(v=>v.trim()).filter(Boolean) : [];
export function mapProfile(row, universities=[]) {
 const out={};
 for(const key of ['firstName','lastName','phone']) if(row[key]) out[key]=row[key];
 if(row.linkedin) out.linkedIn=row.linkedin;
 if(row.education) out.major=row.education;
 if(['18-23','24-30','30+'].includes(row.age)) out.ageRange=row.age;
 const gender={male:'Male',female:'Female',prefer_not_to_say:'Prefer not to say'}[row.gender?.toLowerCase()];
 if(gender) out.gender=gender;
 const region={beirut:'Beirut',metn_baabda:'Metn/Baabda',jbeil_keserwen:'Jbeil/Keserwen',aley_chouf:'Aley/Chouf',north:'North',akkar:'Akkar',south_nabatiyi:'South/Nabatiyi',beqaa_hermel:'Beqaa/Hermel',outside_lebanon:'Outside Lebanon'}[row.region];
 if(region) out.region=region; // akkar_north is ambiguous: attendee must choose.
 const specialization={frontend_developer:'Frontend Developer',backend_developer:'Backend Developer',full_stack:'Full Stack Developer',ai_engineer:'AI Engineer',ai_researcher:'AI Researcher',data_scientist:'Data Scientist',data_engineer:'Data Engineer',cloud_engineer:'Cloud Engineer',devops_engineer:'DevOps Engineer',mobile_developer:'Mobile Developer',product_manager:'Product Manager',project_manager:'Project Manager',ux_ui_designer:'UX/UI Designer',qa_engineer:'QA Engineer'}[row.specialization];
 if(specialization) out.specialization=specialization;
 if(row.company) {
  const uni=universities.find(u=>u.full_name.toLowerCase()===row.company.toLowerCase());
  out.company=uni?'':row.company;out.university=uni?uni.abbreviation:'';
 }
 const experience={undergrad_student:['Student',0],bootcamp:['Student',5],fresh_grad:['Student',4],'0-1':['Professional',1],'1-3':['Professional',2],'3-5':['Professional',3],'5+':['Professional',4]};
 const matched=split(row.experience).map(x=>experience[x]).filter(Boolean);
 if(matched.length) {
  out.activeExpCategories=[...new Set(matched.map(x=>x[0]))];
  out.expLevels={Student:0,Professional:0,'Manager / Team Lead':0};
  for(const [cat,level] of matched) out.expLevels[cat]=level;
 }
 // Event answers and old comments are intentionally not carried into a new RSVP.
 return out;
}
